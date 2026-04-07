import os, base64, json, re
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import anthropic
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
import io

app = Flask(__name__)
CORS(app)

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

# ── BUDGET LINE DEFINITIONS ───────────────────────────────────────────────────
BUDGET_LINES = [
    ('100000','Producers','full'),
    ('120000','Rights & Clearances','prep_only'),
    ('140000','Office Production Staff','prep_shoot_plus4'),
    ('160000','Talent Fees','talent_fees'),
    ('170000','Talent Travel & Exp','prep_only'),
    ('180000','Stunts/Extras','shoot_only'),
    ('200000','Casting','casting'),
    ('220000','Directors','shoot_plus2'),
    ('240000','Producers (Field)','shoot_plus2'),
    ('250000','Field Production Staff','shoot_plus2'),
    ('270000','Talent Management','casting'),
    ('340000','Video Tape Production','shoot_plus2'),
    ('380000','Field Camera','shoot_plus2'),
    ('390000','Studio Camera','shoot_plus2'),
    ('440000','Field Audio','shoot_plus2'),
    ('450000','Studio Audio','shoot_plus2'),
    ('480000','Grip/Electric','shoot_plus2'),
    ('500000','Art Department','shoot_plus4'),
    ('540000','Locations','prep_shoot'),
    ('560000','Makeup/Hair','shoot_plus2'),
    ('570000','Costume','shoot_plus4'),
    ('600000','Transportation','shoot_plus2'),
    ('640000','Field Equipment','shoot_plus4'),
    ('660000','Studio Equipment','shoot_plus4'),
    ('680000','Production Travel','shoot_plus4'),
    ('700000','Set Operations','shoot_plus4'),
    ('720000','Studio Operations','shoot_plus4'),
    ('750000','General & Administrative','full'),
    ('760000','Post Production Staff','post_plus2'),
    ('780000','Graphics/Acquired Ftg','graphics'),
    ('800000','Music','post'),
    ('820000','Post Finishing','post'),
    ('840000','Transcriptions','post'),
    ('860000','Equipment & Expenses','post'),
    ('880000','Master Delivery','post'),
    ('PCFEE','Production Co Fee','full'),
    ('FMTFEE','Format Fee','full'),
    ('AGYFEE','Agency Fee','full'),
    ('LGLFEE','Legal Fee','full'),
    ('INSUR','Insurance','week1'),
]

# ── PHASE NAME NORMALIZATION ──────────────────────────────────────────────────
# Maps any variant phase name to its canonical spread category.
# The display name (from AI) is preserved for the staircase row; this mapping
# is used only for spread rule lookups and payment milestones.
#
# KEY RULE — PRODUCTION:
# Everything from the first truck roll (Load In) through the last strike or
# shoot day is ONE continuous "Production" window for cash flow purposes.
# Dark days, travel days, rehearsals, ESU, strike — all fall inside it.
# Sub-phases (Shoot Pitches, Field Pranks, etc.) display on the staircase
# as informational rows but map to the same canonical PRODUCTION category.
PHASE_ALIASES = {
    'CASTING':    ['CASTING'],
    'PREP':       ['PREP','PRE-PRODUCTION','PRE PRODUCTION','FIELD PREP',
                   'FIELD PRANKS PREP','STUDIO PREP','PREP FIELD PRANKS',
                   'PRE PROD'],
    'PRODUCTION': ['PRODUCTION','SHOOT','SHOOT PITCHES','SHOOT PRANKS',
                   'SHOOT EPISODES','SHOOT PRANK','SHOOT PITCH','SHOOT EPISODE',
                   'FIELD SHOOT','STUDIO SHOOT','PRINCIPAL PHOTOGRAPHY',
                   'FIELD PRANKS','TAPING','FILMING','LOAD IN','LOAD-IN',
                   'LOAD','LOADIN','ESU','SET UP','SETUP','REHEARSAL',
                   'STRIKE','DARK','HIATUS','TRAVEL','LOAD OUT','LOAD-OUT',
                   'PRANK STAGE','PITCH STAGE','FIELD PRANK'],
    'POST':       ['POST','POST PRODUCTION','POST-PRODUCTION',
                   'POST WRAP','DELIVERY','WRAP'],
}

def canonical_phase(name):
    """Return the canonical spread category for a phase name."""
    upper = name.upper().strip()
    for canon, aliases in PHASE_ALIASES.items():
        if upper in aliases or any(a in upper for a in aliases):
            return canon
    return None

# ── CALENDAR HELPERS ──────────────────────────────────────────────────────────
def get_monday(d):
    return d - timedelta(days=d.weekday())

def wk_idx(d, wk1):
    return round((get_monday(d) - wk1).days / 7)

def parse_date(s):
    for fmt in ('%Y-%m-%d','%m/%d/%Y','%m/%d/%y'):
        try:
            return datetime.strptime(s.strip(), fmt)
        except ValueError:
            continue
    return None

# ── SPREAD ENGINE ─────────────────────────────────────────────────────────────
def build_phase_ranges(phases, wk1, nw):
    """
    Build canonical-category -> (start_wk, end_wk) mapping.
    Merges ALL phases of the same canonical category into one continuous span.
    This means every load-in, ESU, shoot block, strike etc. collapses into
    one PRODUCTION range spanning first load to last shoot/strike.
    """
    ranges = {}
    for ph in phases:
        canon = canonical_phase(ph['name'])
        if not canon:
            continue
        s = parse_date(ph['start'])
        e = parse_date(ph['end'])
        if not s or not e:
            continue
        si = max(0, wk_idx(s, wk1))
        ei = min(nw-1, wk_idx(e, wk1))
        if canon in ranges:
            ranges[canon] = (min(ranges[canon][0], si), max(ranges[canon][1], ei))
        else:
            ranges[canon] = (si, ei)
    return ranges

def spread(spread_type, amt, nw, pr):
    """pr = phase ranges dict from build_phase_ranges"""
    w = [0.0] * nw
    if not amt:
        return w

    def fill(s, e, a):
        s = max(0, s)
        e = min(nw-1, e)
        if s > e:
            return
        pw = a / (e - s + 1)
        for i in range(s, e+1):
            w[i] += pw

    cs, ce   = pr.get('CASTING',    (0, 0))
    ps, pe   = pr.get('PREP',       (0, 0))
    ss, se   = pr.get('PRODUCTION', (0, 0))   # PRODUCTION = full load-to-strike window
    pos, poe = pr.get('POST',       (0, nw-1))

    if spread_type == 'full':               fill(0, nw-1, amt)
    elif spread_type == 'casting':          fill(cs, ce, amt)
    elif spread_type == 'prep_only':        fill(ps, pe, amt)
    elif spread_type == 'prep_shoot':       fill(ps, se, amt)
    elif spread_type == 'prep_shoot_plus4': fill(ps, se+4, amt)
    elif spread_type == 'talent_fees':      fill(max(0, ss-3), se, amt)
    elif spread_type == 'shoot_only':       fill(ss, se, amt)
    elif spread_type == 'shoot_plus2':      fill(max(0, ss-2), se, amt)
    elif spread_type == 'shoot_plus4':      fill(max(0, ss-4), se, amt)
    elif spread_type == 'post':             fill(pos, poe, amt)
    elif spread_type == 'post_plus2':       fill(max(0, pos-2), poe, amt)
    elif spread_type == 'graphics':
        fill(max(0, ss-4), pos-1, amt/2)
        fill(pos, poe, amt/2)
    elif spread_type == 'week1':            w[0] += amt
    else:                                   fill(0, nw-1, amt)
    return w

# ── PAYMENT ENGINE ────────────────────────────────────────────────────────────
def compute_payments(wk_totals, nw, pr, phases):
    cs, ce   = pr.get('CASTING',    (0, 0))
    ps, pe   = pr.get('PREP',       (0, 0))
    ss, se   = pr.get('PRODUCTION', (0, 0))
    pos, poe = pr.get('POST',       (0, nw-1))

    mid_prep = (ps + pe) // 2
    mid_post = (pos + poe) // 2

    ms = []
    labels = []

    # P1 — start of casting / first phase
    ms.append(cs if 'CASTING' in pr else min(v[0] for v in pr.values()))
    labels.append('Start of Casting' if 'CASTING' in pr else 'Start of Production')

    # P2 — mid prep
    if 'PREP' in pr:
        ms.append(mid_prep)
        labels.append('Mid Prep')
    else:
        ms.append(min(v[0] for v in pr.values()) + nw//4)
        labels.append('Mid Pre-Production')

    # P3 — start of production / P4 — end of production
    if 'PRODUCTION' in pr:
        ms.append(ss); labels.append('Start of Production')
        ms.append(se); labels.append('End of Production')
    else:
        ms.append(nw//2); labels.append('Mid Production')

    # P5 — mid post
    if 'POST' in pr:
        ms.append(mid_post); labels.append('Mid Post')

    # P6 — final delivery
    last = max(v[1] for v in pr.values())
    ms.append(last)
    labels.append('Final Delivery')

    # Deduplicate and sort
    combined = sorted(set(zip(ms, labels)), key=lambda x: x[0])
    ms     = [x[0] for x in combined]
    labels = [x[1] for x in combined]

    ranges = []
    for i in range(len(ms)-1):
        ranges.append((ms[i], ms[i+1]-1))
    ranges.append((ms[-1], nw-1))

    result = []
    for i, (s, e) in enumerate(ranges):
        total = sum(wk_totals[max(0,s):min(nw,e+1)])
        result.append({
            'label':     f'Payment {i+1}',
            'milestone': labels[i] if i < len(labels) else f'Payment {i+1}',
            'start': s, 'end': e, 'amount': total
        })
    return result

# ── EXCEL BUILDER ─────────────────────────────────────────────────────────────
def build_excel(show_info, phases, budget_vals):
    title  = show_info.get('showTitle','Untitled Show')
    network= show_info.get('network','')
    prod_co= show_info.get('prodCo','')

    # Sort phases chronologically
    def phase_start(p):
        d = parse_date(p['start'])
        return d if d else datetime(2099,1,1)
    phases = sorted(phases, key=phase_start)

    # Calendar
    starts = [parse_date(p['start']) for p in phases if parse_date(p['start'])]
    ends   = [parse_date(p['end'])   for p in phases if parse_date(p['end'])]
    if not starts or not ends:
        raise ValueError('No valid phase dates found')

    wk1 = get_monday(min(starts))
    last = get_monday(max(ends))
    nw   = round((last - wk1).days / 7) + 1

    def wk_date(i):
        return wk1 + timedelta(weeks=i)

    pr = build_phase_ranges(phases, wk1, nw)

    # Spread each budget line
    line_data = []
    for acct, label, stype in BUDGET_LINES:
        amt = budget_vals.get(acct, 0) or 0
        wks = spread(stype, amt, nw, pr)
        line_data.append((acct, label, amt, wks))

    wk_totals = [sum(ld[3][i] for ld in line_data) for i in range(nw)]
    payments  = compute_payments(wk_totals, nw, pr, phases)

    # ── STYLES ────────────────────────────────────────────────────────────────
    BOLD12  = Font(name='Arial', size=12, bold=True)
    REG12   = Font(name='Arial', size=12, bold=False)
    BOLD14  = Font(name='Arial', size=14, bold=True)
    GRAY    = PatternFill('solid', fgColor='C0C0C0')
    NOFILL  = PatternFill(fill_type=None)
    CTR     = Alignment(horizontal='center', vertical='center')
    LFT     = Alignment(horizontal='left',   vertical='center')
    FMT     = '#,##0'

    def ap(cell, font=None, fill=None, align=None, fmt=None):
        if font:  cell.font = font
        if fill:  cell.fill = fill
        if align: cell.alignment = align
        if fmt:   cell.number_format = fmt

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Cash Flow'

    CA, CB, CC, CW1 = 1, 2, 3, 4
    CWL = CW1 + nw - 1
    CTT = CW1 + nw
    NP  = len(phases)
    NL  = len(line_data)
    NPM = len(payments)

    def cl(c): return get_column_letter(c)

    # Row layout
    R_TITLE = 1
    R_SUB   = 2
    R_WKN   = 4
    R_DAT   = 5
    R_PH0   = 7                    # phase staircase starts here
    R_HDR   = R_PH0 + NP + 1
    R_DS    = R_HDR + 2
    R_DE    = R_DS + NL - 1
    R_TOT   = R_DE + 2
    R_PS    = R_TOT + 3
    R_PE    = R_PS + NPM - 1
    R_PSUM  = R_PE + 2
    R_SHDR  = R_PSUM + 4
    R_SDAT  = R_SHDR + 2
    R_SEND  = R_SDAT + NPM - 1
    R_GRAND = R_SEND + 2

    # Title & subtitle
    run_date = datetime.now().strftime('%m/%d/%Y')
    ws.cell(R_TITLE, CA, 'CASH FLOW')
    ap(ws.cell(R_TITLE, CA), font=BOLD14, align=LFT)
    ws.cell(R_SUB, CA, '   |   '.join(filter(None,[title,network,prod_co])) + f'   |   Generated {run_date}')
    ap(ws.cell(R_SUB, CA), font=BOLD12, align=LFT)
    ws.row_dimensions[R_TITLE].height = 22

    # Week number & date rows
    ap(ws.cell(R_WKN, CC, 'BUDGET TOTAL'), font=BOLD12, align=CTR)
    for i in range(nw):
        ap(ws.cell(R_WKN, CW1+i, f'WK {i+1}'), font=BOLD12, align=CTR)
    ap(ws.cell(R_WKN, CTT, 'TOTAL'), font=BOLD12, align=CTR)
    for i in range(nw):
        ap(ws.cell(R_DAT, CW1+i, wk_date(i).strftime('%m/%d/%y')), font=BOLD12, align=CTR)

    # Phase staircase — gray bars, one row per phase
    for pi, ph in enumerate(phases):
        r = R_PH0 + pi
        ap(ws.cell(r, CB, ph['name']), font=BOLD12, align=CTR)
        s_date = parse_date(ph['start'])
        e_date = parse_date(ph['end'])
        if s_date and e_date:
            ph_s = max(0, wk_idx(s_date, wk1))
            ph_e = min(nw-1, wk_idx(e_date, wk1))
            for i in range(nw):
                c = ws.cell(r, CW1+i)
                if ph_s <= i <= ph_e:
                    c.value = ph['name']
                    ap(c, font=BOLD12, fill=GRAY, align=CTR)
                else:
                    ap(c, fill=NOFILL)

    # Column headers
    for col, txt in [(CA,'ACCT#'),(CB,'DESCRIPTION'),(CC,'BUDGET TOTAL')]:
        ap(ws.cell(R_HDR, col, txt), font=BOLD12, align=CTR)
    for i in range(nw):
        ap(ws.cell(R_HDR, CW1+i, f'WK {i+1}'), font=BOLD12, align=CTR)
    ap(ws.cell(R_HDR, CTT, 'TOTAL'), font=BOLD12, align=CTR)
    ws.row_dimensions[R_HDR].height = 18

    wkf = cl(CW1); wkl = cl(CWL)

    # Data rows
    for idx, (acct, label, budget, wks) in enumerate(line_data):
        r = R_DS + idx
        ap(ws.cell(r, CA, acct),   font=REG12, align=CTR)
        ap(ws.cell(r, CB, label),  font=REG12, align=LFT)
        ap(ws.cell(r, CC, budget), font=REG12, align=CTR, fmt=FMT)
        for i, v in enumerate(wks):
            rv = round(v)
            if rv != 0:
                ap(ws.cell(r, CW1+i, rv), font=REG12, align=CTR, fmt=FMT)
        c = ws.cell(r, CTT)
        c.value = f'=SUM({wkf}{r}:{wkl}{r})'
        ap(c, font=REG12, align=CTR, fmt=FMT)

    # Totals row
    r = R_TOT; bc = cl(CC)
    ap(ws.cell(r, CB, 'TOTAL'), font=BOLD12, align=CTR)
    c = ws.cell(r, CC)
    c.value = f'=SUM({bc}{R_DS}:{bc}{R_DE})'
    ap(c, font=BOLD12, align=CTR, fmt=FMT)
    for i in range(nw):
        wc = cl(CW1+i)
        c = ws.cell(r, CW1+i)
        c.value = f'=SUM({wc}{R_DS}:{wc}{R_DE})'
        ap(c, font=REG12, align=CTR, fmt=FMT)
    c = ws.cell(r, CTT)
    c.value = f'=SUM({wkf}{r}:{wkl}{r})'
    ap(c, font=BOLD12, align=CTR, fmt=FMT)
    ws.row_dimensions[r].height = 18

    # Payment staircase
    for pi, pmt in enumerate(payments):
        r = R_PS + pi
        ap(ws.cell(r, CB, pmt['label']), font=REG12, align=CTR)
        for i in range(nw):
            c = ws.cell(r, CW1+i)
            if pmt['start'] <= i <= pmt['end']:
                ap(c, fill=GRAY)
            else:
                ap(c, fill=NOFILL)
        fc = cl(CW1+pmt['start']); lc = cl(CW1+pmt['end'])
        tot_row = R_TOT
        if pmt['start'] == pmt['end']:
            formula = f'={lc}{tot_row}'
        else:
            formula = f'=+SUM({fc}{tot_row}:{lc}{tot_row})'
        c = ws.cell(r, CW1+pmt['end'])
        c.value = formula
        ap(c, font=REG12, align=CTR, fmt=FMT, fill=GRAY)
        c = ws.cell(r, CC)
        c.value = f'={lc}{r}'
        ap(c, font=REG12, align=CTR, fmt=FMT)
        c = ws.cell(r, CTT)
        c.value = f'=SUM({wkf}{r}:{wkl}{r})'
        ap(c, font=REG12, align=CTR, fmt=FMT)

    # Payment total validation
    r = R_PSUM; bc = cl(CC); tc = cl(CTT)
    ap(ws.cell(r, CB, 'Payment Total'), font=REG12, align=CTR)
    c = ws.cell(r, CC)
    c.value = f'=SUM({bc}{R_PS}:{bc}{R_PE})'
    ap(c, font=REG12, align=CTR, fmt=FMT)
    c = ws.cell(r, CTT)
    c.value = f'=SUM({tc}{R_PS}:{tc}{R_PE})'
    ap(c, font=REG12, align=CTR, fmt=FMT)

    # Payment schedule
    ap(ws.cell(R_SHDR, CB, 'Payment Schedule'), font=BOLD12, align=CTR)
    ap(ws.cell(R_SHDR, CC, 'Milestone'),        font=BOLD12, align=CTR)
    ap(ws.cell(R_SHDR, CW1, 'Date'),            font=BOLD12, align=CTR)
    ap(ws.cell(R_SHDR, CW1+1, 'Amount'),        font=BOLD12, align=CTR)

    for pi, pmt in enumerate(payments):
        r = R_SDAT + pi
        ap(ws.cell(r, CB, pmt['label']),     font=REG12, align=CTR)
        ap(ws.cell(r, CC, pmt['milestone']), font=REG12, align=CTR)
        ap(ws.cell(r, CW1, wk_date(min(pmt['start'], nw-1)).strftime('%m/%d/%y')), font=REG12, align=CTR)
        pr_row = R_PS + pi
        c = ws.cell(r, CW1+1)
        c.value = f'={cl(CC)}{pr_row}'
        ap(c, font=REG12, align=CTR, fmt=FMT)

    # Grand total
    r = R_GRAND; ac = cl(CW1+1)
    ap(ws.cell(r, CC, 'Total:'), font=BOLD12, align=CTR)
    c = ws.cell(r, CW1+1)
    c.value = f'=SUM({ac}{R_SDAT}:{ac}{R_SEND})'
    ap(c, font=BOLD12, align=CTR, fmt=FMT)

    # Column widths
    ws.column_dimensions[cl(CA)].width = 10
    ws.column_dimensions[cl(CB)].width = 32
    ws.column_dimensions[cl(CC)].width = 17
    for i in range(nw):
        ws.column_dimensions[cl(CW1+i)].width = 13
    ws.column_dimensions[cl(CTT)].width = 17

    ws.freeze_panes = ws.cell(R_DS, CW1)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf, title

# ── AI PARSERS ────────────────────────────────────────────────────────────────
def parse_budget_pdf(pdf_b64):
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    account_list = '\n'.join(f"{a}: {l}" for a,l,_ in BUDGET_LINES)
    prompt = f"""You are reading a production budget top sheet PDF.

Extract the dollar total for each account number listed below.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Format: {{"100000": 1234567, "140000": 456789, ...}}

Also extract show metadata if visible, adding these keys:
"_showTitle": "show name",
"_network": "network name",
"_prodCo": "production company",
"_numEps": number of episodes as integer

Only include accounts where you find a clear dollar total.
Use integers only — no decimals, commas, or $ signs.

Accounts to find:
{account_list}"""

    response = client.messages.create(
        model='claude-opus-4-5',
        max_tokens=1500,
        messages=[{
            'role': 'user',
            'content': [
                {'type':'document','source':{'type':'base64','media_type':'application/pdf','data':pdf_b64}},
                {'type':'text','text':prompt}
            ]
        }]
    )
    raw = response.content[0].text.strip()
    clean = re.sub(r'^```[a-z]*\n?','',raw).replace('```','').strip()
    return json.loads(clean)

def parse_calendar_pdf(pdf_b64):
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = """You are reading a TV production calendar PDF.

Extract ALL named production phases and their date ranges.
Include every phase you see — there may be more or fewer than five.

Rules:
- If a phase label shows "Week 10" as the first visible occurrence, count backward to find Week 1 start date
- Use Monday of the first active week as start date
- Use Friday of the last active week as end date
- Phases can and do overlap — that is correct
- Include ALL phases: CASTING, PREP, LOAD IN, SHOOT, POST and any variants like
  SHOOT PITCHES, SHOOT PRANKS, SHOOT EPISODES, FIELD PRANKS, FIELD PRANKS PREP,
  DELIVERY, WRAP, PICKUPS, HIATUS, etc.
- Use the exact phase name as it appears on the calendar

Return ONLY valid JSON array, no markdown, no explanation:
[
  {"name": "CASTING",       "start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
  {"name": "PREP",          "start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
  {"name": "SHOOT PITCHES", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}
]
Sort by start date. Only include phases you can confidently identify."""

    response = client.messages.create(
        model='claude-opus-4-5',
        max_tokens=1200,
        messages=[{
            'role': 'user',
            'content': [
                {'type':'document','source':{'type':'base64','media_type':'application/pdf','data':pdf_b64}},
                {'type':'text','text':prompt}
            ]
        }]
    )
    raw = response.content[0].text.strip()
    clean = re.sub(r'^```[a-z]*\n?','',raw).replace('```','').strip()
    parsed = json.loads(clean)

    # Handle both array and legacy object format
    if isinstance(parsed, dict):
        parsed = [{'name':k,'start':v['start'],'end':v['end']}
                  for k,v in parsed.items() if isinstance(v,dict) and 'start' in v]

    # Sort by start date
    def sort_key(p):
        d = parse_date(p.get('start',''))
        return d if d else datetime(2099,1,1)

    return sorted(parsed, key=sort_key)

# ── ROUTES ────────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status':'ok','service':'StudioChief'})

@app.route('/parse-budget', methods=['POST'])
def parse_budget():
    try:
        data = request.get_json()
        pdf_b64 = data.get('pdf_b64','')
        if not pdf_b64:
            return jsonify({'error':'No PDF data'}), 400
        result = parse_budget_pdf(pdf_b64)
        return jsonify({'ok':True,'data':result})
    except Exception as e:
        return jsonify({'ok':False,'error':str(e)}), 500

@app.route('/parse-calendar', methods=['POST'])
def parse_calendar():
    try:
        data = request.get_json()
        pdf_b64 = data.get('pdf_b64','')
        if not pdf_b64:
            return jsonify({'error':'No PDF data'}), 400
        phases = parse_calendar_pdf(pdf_b64)
        return jsonify({'ok':True,'phases':phases})
    except Exception as e:
        return jsonify({'ok':False,'error':str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        show_info   = data.get('showInfo', {})
        phases      = data.get('phases', [])
        budget_vals = data.get('budgetVals', {})

        if not phases:
            return jsonify({'error':'No phases provided'}), 400
        if not any(budget_vals.values()):
            return jsonify({'error':'All budget values are zero'}), 400

        buf, title = build_excel(show_info, phases, budget_vals)

        date_stamp = datetime.now().strftime('%Y-%m-%d')
        safe_title = re.sub(r'[^a-zA-Z0-9_\- ]','',title).strip().replace(' ','_')
        filename   = f'{safe_title}_CashFlow_{date_stamp}.xlsx'

        return send_file(
            buf,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error':str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
