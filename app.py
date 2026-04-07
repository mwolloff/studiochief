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
# Display names on the staircase are consolidated to the canonical name —
# so "LOAD", "ESU", "SHOOT PITCHES" etc. all display as "PRODUCTION".
#
# CORE RULE: Cash flow spreads continuously across each phase window.
# No breaks for holidays, dark weeks, hiatuses, or Thanksgiving/Christmas.
# The outer boundary (first day to last day) is what matters.
#
# FOUR CANONICAL PHASES:
#   CASTING    — talent search through last callback/round
#   PREP       — office open through last prep day before production
#   PRODUCTION — first truck roll through last strike day (no gaps)
#   POST       — edit start through final delivery
#
# HIATUS rule: always PRODUCTION (crew costs continue mid-shoot)
# WRAP rule: always POST (refers to wrapping the show, not a shoot day)
# HOLIDAY/DARK weeks: ignored — spread continues through them

PHASE_ALIASES = {
    'CASTING': [
        'CASTING', 'CASTING PERIOD', 'TALENT SEARCH', 'AUDITIONS',
        'CALLBACKS', 'CASTING ROUNDS', 'CASTING SESSIONS',
    ],
    'PREP': [
        'PREP', 'PRE-PRODUCTION', 'PRE PRODUCTION', 'PRE-PROD', 'PRE PROD',
        'FIELD PREP', 'STUDIO PREP', 'FIELD PRANKS PREP', 'PREP FIELD PRANKS',
        'OFFICE OPEN', 'START STAFF', 'STAFF START', 'OFFICE START',
        'SCOUT', 'TECH SCOUT', 'LOCATION SCOUT', 'SCOUTS',
        'READ THROUGH', 'TABLE READ',
    ],
    'PRODUCTION': [
        # Load / Setup
        'LOAD', 'LOAD IN', 'LOAD-IN', 'LOADIN', 'LOAD OUT', 'LOAD-OUT',
        'LOADOUT', 'ESU', 'EQUIPMENT SET UP', 'EQUIPMENT SETUP',
        'SET UP', 'SETUP', 'TECH SET UP', 'TECH SETUP', 'RIG',
        # Shoot variants
        'SHOOT', 'SHOOT DAY', 'SHOOTING', 'PRODUCTION',
        'SHOOT PITCHES', 'SHOOT PRANKS', 'SHOOT EPISODES',
        'SHOOT PRANK', 'SHOOT PITCH', 'SHOOT EPISODE',
        'FIELD SHOOT', 'STUDIO SHOOT', 'FIELD PRANKS', 'FIELD PRANK',
        'PRANK STAGE', 'PITCH STAGE', 'STUDIO STAGE',
        'TAPING', 'TAPE', 'FILMING', 'FILM DAY',
        'PRINCIPAL PHOTOGRAPHY', 'RECORD', 'RECORDING', 'RECORDING DAY',
        # Rehearsal variants
        'REHEARSE', 'REHEARSAL', 'REHEARSALS', 'TECH REHEARSE',
        'TECH REHEARSAL', 'DRY RUN', 'RUN THROUGH', 'RUN-THROUGH',
        'CAMERA REHEARSAL', 'DRESS REHEARSAL', 'BLOCKING',
        # Production support days
        'VTR', 'PLAYBACK', 'PLAYBACK DAY',
        'TRAVEL', 'TRAVEL DAY', 'TRAVEL DAYS',
        'DARK', 'DARK DAY', 'DARK WEEK', 'DOWN DAY',
        'STRIKE', 'STRIKE DAY', 'WRAP DAY', 'SET STRIKE',
        'HIATUS', 'BREAK', 'HOLIDAY BREAK', 'CHRISTMAS', 'THANKSGIVING',
        # Field/location specific
        'FIELD PRANKS X', 'FIELD PRANKS WEEK', 'BTS', 'BEHIND THE SCENES',
        'LOCATION SHOOT', 'ON LOCATION', 'REMOTE SHOOT',
    ],
    'POST': [
        'POST', 'POST PRODUCTION', 'POST-PRODUCTION', 'POST-PROD', 'POST PROD',
        'EDIT', 'EDITING', 'EDITORIAL', 'OFFLINE', 'OFFLINE EDIT',
        'ONLINE', 'ONLINE EDIT', 'COLOR', 'COLOR CORRECT', 'COLOR CORRECTION',
        'MIX', 'AUDIO MIX', 'SOUND MIX', 'FINISHING', 'POST FINISHING',
        'DELIVERY', 'MASTER DELIVERY', 'DELIVERIES',
        'QC', 'QUALITY CONTROL', 'QUALITY CHECK',
        'CLOSED CAPTIONING', 'CAPTIONING', 'CC',
        'VFX', 'VISUAL EFFECTS', 'GRAPHICS',
        'WRAP', 'POST WRAP', 'PRODUCTION WRAP',
        'TRANSCRIPTION', 'TRANSCRIPTIONS',
    ],
}

# Keywords that contain these strings anywhere map to PRODUCTION
# (catches things like "PREP FIELD PRANKS X (3) TEAMS")
PRODUCTION_CONTAINS = [
    'SHOOT', 'LOAD', 'ESU', 'FIELD PRANK', 'PRANK STAGE', 'PITCH STAGE',
    'REHEARS', 'DRY RUN', 'RUN THROUGH', 'STRIKE', 'HIATUS', 'DARK',
    'TRAVEL', 'TAPING', 'FILMING', 'VTR', 'PLAYBACK', 'BTS',
]

PREP_CONTAINS = [
    'PREP', 'SCOUT', 'PRE-PROD', 'PRE PROD',
]

CASTING_CONTAINS = [
    'CASTING', 'AUDITION', 'CALLBACK',
]

POST_CONTAINS = [
    'POST', 'EDIT', 'COLOR', 'MIX', 'DELIVER', 'QC', 'CAPTIO',
]

def canonical_phase(name):
    """Return canonical phase category for any phase name."""
    upper = name.upper().strip()

    # Exact match first
    for canon, aliases in PHASE_ALIASES.items():
        if upper in aliases:
            return canon

    # Substring match — order matters (PRODUCTION before PREP to avoid
    # "FIELD PRANKS PREP" matching PREP instead of PRODUCTION)
    if any(kw in upper for kw in PRODUCTION_CONTAINS):
        return 'PRODUCTION'
    if any(kw in upper for kw in CASTING_CONTAINS):
        return 'CASTING'
    if any(kw in upper for kw in POST_CONTAINS):
        return 'POST'
    if any(kw in upper for kw in PREP_CONTAINS):
        return 'PREP'

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

    # ── STAIRCASE DISPLAY PHASES ─────────────────────────────────────────────
    # Consolidate all AI-returned phases into the four clean canonical bars
    # for display. The full sub-phase detail informed the date ranges above;
    # the staircase shows CASTING / PREP / PRODUCTION / POST only.
    # This prevents confusing displays like "LOAD...LOAD...LOAD" for 12 weeks.
    display_phases = []
    canon_order = ['CASTING', 'PREP', 'PRODUCTION', 'POST']
    for canon in canon_order:
        if canon in pr:
            display_phases.append({
                'name':  canon,
                'start': (wk1 + timedelta(weeks=pr[canon][0])).strftime('%Y-%m-%d'),
                'end':   (wk1 + timedelta(weeks=pr[canon][1])).strftime('%Y-%m-%d'),
            })

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
    NP  = len(display_phases)
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

    # Phase staircase — gray bars, one row per canonical phase
    for pi, ph in enumerate(display_phases):
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

# ── COST REPORT PARSER ───────────────────────────────────────────────────────
def parse_cost_report_pdf(pdf_b64):
    client = anthropic.Anthropic(
        api_key=ANTHROPIC_API_KEY,
        timeout=300.0,  # 5 minute timeout for large cost reports
    )
    prompt = """You are reading a TV/film production cost report PDF.

Extract every line item you can find. For each line return:
- acct: account number (e.g. "100408")
- dept: department/account group name (e.g. "PRODUCERS")
- description: line item description (e.g. "Co-Executive Producer")
- is_total: true if this is a department total row, false for detail lines
- actuals: actual spend to date (number, 0 if blank)
- pos: purchase orders / commitments (number, 0 if blank)
- efc: estimate at final cost — use the EFC column if present, otherwise Total Cost (number, 0 if blank)
- budget: approved budget amount (number, 0 if blank)
- variance: variance amount if shown (number, null if not shown) — NOTE: some reports show overages as negative

Also extract show metadata if visible:
- showTitle, network, prodCo, period (cost report period number or date)

Return ONLY valid JSON, no markdown:
{
  "showTitle": "Show Name",
  "network": "NBC",
  "prodCo": "Production Co",
  "period": "6",
  "lines": [
    {
      "acct": "100408",
      "dept": "PRODUCERS",
      "description": "Co-Executive Producer",
      "is_total": false,
      "actuals": 349711,
      "pos": 0,
      "efc": 349711,
      "budget": 370880,
      "variance": 21169
    }
  ]
}

Use integers only. If a value is blank or dash, use 0. Include ALL lines including totals and grand total."""

    response = client.messages.create(
        model='claude-opus-4-5',
        max_tokens=16000,
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

# ── VARIANCE EXCEL BUILDER ────────────────────────────────────────────────────
def build_variance_excel(show_info, lines, threshold=10):
    title   = show_info.get('showTitle','Untitled Show')
    network = show_info.get('network','')
    prod_co = show_info.get('prodCo','')
    period  = show_info.get('period','')

    wb = openpyxl.Workbook()

    # ── SHEET 1: HOT SHEET (line producer view) ───────────────────────────────
    ws1 = wb.active
    ws1.title = 'Hot Sheet'

    # Color fills
    RED        = PatternFill('solid', fgColor='FF4444')
    RED_ORANGE = PatternFill('solid', fgColor='FF7733')
    ORANGE     = PatternFill('solid', fgColor='FFB300')
    YELLOW     = PatternFill('solid', fgColor='FFE566')
    BLUE       = PatternFill('solid', fgColor='99CCFF')
    GRAY_HDR   = PatternFill('solid', fgColor='D0D0D0')
    GRAY_DEPT  = PatternFill('solid', fgColor='E8E8E8')
    NOFILL     = PatternFill(fill_type=None)

    BOLD12  = Font(name='Arial', size=11, bold=True)
    REG11   = Font(name='Arial', size=11)
    BOLD11  = Font(name='Arial', size=11, bold=True)
    BOLD14  = Font(name='Arial', size=13, bold=True)
    CTR     = Alignment(horizontal='center', vertical='center')
    LFT     = Alignment(horizontal='left',   vertical='center')
    RGT     = Alignment(horizontal='right',  vertical='center')
    FMT     = '#,##0'
    PCTFMT  = '0.0%'

    def ap(cell, font=None, fill=None, align=None, fmt=None):
        if font:  cell.font  = font
        if fill:  cell.fill  = fill
        if align: cell.alignment = align
        if fmt:   cell.number_format = fmt

    run_date = datetime.now().strftime('%m/%d/%Y')
    period_str = f'Period {period}' if period else ''

    # Title rows
    ws1.cell(1,1,'HOT SHEET — VARIANCE ANALYSIS')
    ap(ws1.cell(1,1), font=BOLD14, align=LFT)
    subtitle = '   |   '.join(filter(None,[title,network,prod_co,period_str])) + f'   |   Generated {run_date}'
    ws1.cell(2,1, subtitle)
    ap(ws1.cell(2,1), font=BOLD11, align=LFT)

    # Color key (top right, columns 7-8)
    key_data = [
        ('31%+ over budget',    RED),
        ('21-30% over budget',  RED_ORANGE),
        ('11-20% over budget',  ORANGE),
        ('1-10% over budget',   YELLOW),
        ('10%+ under budget',   BLUE),
        ('Within 10% (either)', NOFILL),
    ]
    ws1.cell(1,7,'COLOR KEY')
    ap(ws1.cell(1,7), font=BOLD11, align=LFT)
    for i,(label,fill) in enumerate(key_data):
        r = 2+i
        ws1.cell(r,7,'')
        ap(ws1.cell(r,7), fill=fill)
        ws1.cell(r,8, label)
        ap(ws1.cell(r,8), font=REG11, align=LFT)

    # Column headers row 4
    HDR_ROW = 4
    headers = ['ACCT','DESCRIPTION','ACTUALS','POs','EFC','BUDGET','VARIANCE','VAR %','OVER/UNDER']
    for i,h in enumerate(headers):
        c = ws1.cell(HDR_ROW, i+1, h)
        ap(c, font=BOLD12, fill=GRAY_HDR, align=CTR)
    ws1.row_dimensions[HDR_ROW].height = 18

    # Column widths
    widths = [10, 38, 16, 14, 16, 16, 16, 10, 14]
    for i,w in enumerate(widths):
        ws1.column_dimensions[get_column_letter(i+1)].width = w

    # Data rows
    r = HDR_ROW + 1
    for line in lines:
        acct    = line.get('acct','')
        desc    = line.get('description','')
        actuals = line.get('actuals',0) or 0
        pos     = line.get('pos',0) or 0
        efc     = line.get('efc',0) or 0
        budget  = line.get('budget',0) or 0
        is_tot  = line.get('is_total', False)

        # Compute variance — positive = under budget (good), negative = over
        if budget != 0:
            var_amt = budget - efc
            var_pct = var_amt / budget
        else:
            var_amt = 0
            var_pct = 0

        over_under = 'OVER' if var_amt < 0 else ('UNDER' if var_amt > 0 else '')

        # Pick fill color based on variance %
        pct = var_pct * 100  # negative = over
        if pct < -30:            fill = RED
        elif pct < -21:          fill = RED_ORANGE
        elif pct < -11:          fill = ORANGE
        elif pct < -1:           fill = YELLOW
        elif pct <= -0.5:        fill = YELLOW
        elif pct >= 10:          fill = BLUE
        else:                    fill = NOFILL

        font  = BOLD11 if is_tot else REG11
        dfill = GRAY_DEPT if is_tot else fill

        vals = [acct, desc, actuals, pos, efc, budget, var_amt, var_pct, over_under]
        fmts = [None, None, FMT, FMT, FMT, FMT, FMT, PCTFMT, None]
        alns = [CTR, LFT, RGT, RGT, RGT, RGT, RGT, CTR, CTR]

        for i,(v,f,a) in enumerate(zip(vals,fmts,alns)):
            cell = ws1.cell(r, i+1, v)
            cell_fill = GRAY_DEPT if is_tot else (fill if i >= 2 else NOFILL)
            ap(cell, font=font, fill=cell_fill, align=a, fmt=f)

        if is_tot:
            ws1.row_dimensions[r].height = 16
        r += 1

    ws1.freeze_panes = ws1.cell(HDR_ROW+1, 1)

    # ── SHEET 2: VARIANCE REPORT (network view) ───────────────────────────────
    ws2 = wb.create_sheet('Variance Report')

    ws2.cell(1,1,'VARIANCE REPORT')
    ap(ws2.cell(1,1), font=BOLD14, align=LFT)
    ws2.cell(2,1, subtitle)
    ap(ws2.cell(2,1), font=BOLD11, align=LFT)

    HDR2 = 4
    hdrs2 = ['ACCT','DESCRIPTION','BUDGET','EFC','VARIANCE','EXPLANATION']
    for i,h in enumerate(hdrs2):
        c = ws2.cell(HDR2, i+1, h)
        ap(c, font=BOLD12, fill=GRAY_HDR, align=CTR)
    ws2.row_dimensions[HDR2].height = 18

    ws2.column_dimensions['A'].width = 10
    ws2.column_dimensions['B'].width = 38
    ws2.column_dimensions['C'].width = 16
    ws2.column_dimensions['D'].width = 16
    ws2.column_dimensions['E'].width = 16
    ws2.column_dimensions['F'].width = 52

    r2 = HDR2 + 1
    # Variance report shows department totals only (not sub-lines)
    for line in lines:
        if not line.get('is_total', False):
            continue
        acct   = line.get('acct','')
        desc   = line.get('description','')
        budget = line.get('budget',0) or 0
        efc    = line.get('efc',0) or 0
        var    = budget - efc

        is_grand = 'grand' in desc.lower() or 'total' in acct.lower()
        font = BOLD11 if is_grand else REG11
        fill = GRAY_DEPT if is_grand else NOFILL

        for i,(v,f,a) in enumerate(zip(
            [acct, desc, budget, efc, var, ''],
            [None, None, FMT, FMT, FMT, None],
            [CTR, LFT, RGT, RGT, RGT, LFT]
        )):
            cell = ws2.cell(r2, i+1, v)
            ap(cell, font=font, fill=fill, align=a, fmt=f)

        ws2.row_dimensions[r2].height = 18
        r2 += 1

    ws2.freeze_panes = ws2.cell(HDR2+1, 1)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf, title

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

@app.route('/parse-variance', methods=['POST'])
def parse_variance():
    try:
        data = request.get_json()
        pdf_b64 = data.get('pdf_b64','')
        if not pdf_b64:
            return jsonify({'error':'No PDF data'}), 400
        result = parse_cost_report_pdf(pdf_b64)
        return jsonify({'ok':True,'data':result})
    except Exception as e:
        return jsonify({'ok':False,'error':str(e)}), 500

@app.route('/generate-variance', methods=['POST'])
def generate_variance():
    try:
        data      = request.get_json()
        show_info = data.get('showInfo', {})
        lines     = data.get('lines', [])
        threshold = data.get('threshold', 10)

        if not lines:
            return jsonify({'error':'No line items provided'}), 400

        buf, title = build_variance_excel(show_info, lines, threshold)
        date_stamp = datetime.now().strftime('%Y-%m-%d')
        safe_title = re.sub(r'[^a-zA-Z0-9_\- ]','',title).strip().replace(' ','_')
        filename   = f'{safe_title}_Variance_{date_stamp}.xlsx'

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
