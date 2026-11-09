#!/usr/bin/env python3
"""Rebuilds the three data files of the site from the federal sources (RECETTE §4, replayable).

Usage: python3 -I scripts/data/build-data.py [--raw <dir>]

Downloads (with plain curl, no browser) into data/raw/ (kept out of git), then writes:
  src/data/death-care-2022.json  Census Economic Census 2022 (EC2281BASIC, NAICS 8122 / 812210 / 812220)
                                 + Census population estimates NST-EST2024-ALLDATA (deaths by state)
  src/data/life-tables.json      NCHS United States Life Tables 2024 (NVSR 75-05, tables 2 and 3)
                                 + NCHS U.S. State Life Tables 2022 (NVSR 74-12, tables XX-2 and XX-3)
  src/data/cpi-funeral.json      BLS CPI-U, Funeral expenses (CUUR0000SEGD02) and All items (CUUR0000SA0)

All sources are U.S. federal works in the public domain. Nothing here is a price quote.
"""
import csv, io, json, os, subprocess, sys, zipfile

SITE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = sys.argv[sys.argv.index('--raw') + 1] if '--raw' in sys.argv else os.path.join(SITE, 'data', 'raw')
OUT = os.path.join(SITE, 'src', 'data')
os.makedirs(RAW, exist_ok=True)

STATES = [('AL', 'Alabama', '01'), ('AK', 'Alaska', '02'), ('AZ', 'Arizona', '04'), ('AR', 'Arkansas', '05'), ('CA', 'California', '06'),
          ('CO', 'Colorado', '08'), ('CT', 'Connecticut', '09'), ('DE', 'Delaware', '10'), ('DC', 'District of Columbia', '11'), ('FL', 'Florida', '12'),
          ('GA', 'Georgia', '13'), ('HI', 'Hawaii', '15'), ('ID', 'Idaho', '16'), ('IL', 'Illinois', '17'), ('IN', 'Indiana', '18'), ('IA', 'Iowa', '19'),
          ('KS', 'Kansas', '20'), ('KY', 'Kentucky', '21'), ('LA', 'Louisiana', '22'), ('ME', 'Maine', '23'), ('MD', 'Maryland', '24'),
          ('MA', 'Massachusetts', '25'), ('MI', 'Michigan', '26'), ('MN', 'Minnesota', '27'), ('MS', 'Mississippi', '28'), ('MO', 'Missouri', '29'),
          ('MT', 'Montana', '30'), ('NE', 'Nebraska', '31'), ('NV', 'Nevada', '32'), ('NH', 'New Hampshire', '33'), ('NJ', 'New Jersey', '34'),
          ('NM', 'New Mexico', '35'), ('NY', 'New York', '36'), ('NC', 'North Carolina', '37'), ('ND', 'North Dakota', '38'), ('OH', 'Ohio', '39'),
          ('OK', 'Oklahoma', '40'), ('OR', 'Oregon', '41'), ('PA', 'Pennsylvania', '42'), ('RI', 'Rhode Island', '44'), ('SC', 'South Carolina', '45'),
          ('SD', 'South Dakota', '46'), ('TN', 'Tennessee', '47'), ('TX', 'Texas', '48'), ('UT', 'Utah', '49'), ('VT', 'Vermont', '50'),
          ('VA', 'Virginia', '51'), ('WA', 'Washington', '53'), ('WV', 'West Virginia', '54'), ('WI', 'Wisconsin', '55'), ('WY', 'Wyoming', '56')]

def fetch(url, name, post=None):
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        cmd = ['curl', '-s', '-f', '-m', '180', '-o', p]
        if post: cmd += ['-X', 'POST', '-H', 'Content-Type: application/json', '-d', post]
        subprocess.run(cmd + [url], check=True)
    return p

# 1. Census: death-care revenue by state, and deaths by state.
z = fetch('https://www2.census.gov/programs-surveys/economic-census/data/2022/sector81/EC2281BASIC.zip', 'EC2281BASIC.zip')
rev = {}
with zipfile.ZipFile(z) as zf:
    with zf.open('EC2281BASIC.dat') as f:
        for line in io.TextIOWrapper(f, encoding='latin-1'):
            c = line.rstrip('\n').split('|')
            if c[0] not in ('01', '02') or c[9] != '00' or c[15] not in ('8122', '812210', '812220') or c[18] != '00':
                continue
            key = 'US' if c[0] == '01' else c[1]
            val = None if c[26] else int(c[25]) * 1000
            est = None if c[24] else int(c[23])  # RCPTOT in $1,000; a flag (D = withheld) means no value
            rev.setdefault(key, {})[c[15]] = {'revenue': val, 'estab': est}
pe = fetch('https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/state/totals/NST-EST2024-ALLDATA.csv', 'NST-EST2024-ALLDATA.csv')
deaths = {}
for r in csv.DictReader(open(pe, encoding='latin-1')):
    if r['SUMLEV'] == '010': deaths['US'] = (int(r['DEATHS2022']), int(r['DEATHS2023']), int(r['POPESTIMATE2022']))
    elif r['SUMLEV'] == '040': deaths[r['STATE']] = (int(r['DEATHS2022']), int(r['DEATHS2023']), int(r['POPESTIMATE2022']))
def row(key):
    d = rev[key]; dd = deaths[key]
    for k in ('8122', '812210', '812220'): d.setdefault(k, {'revenue': None, 'estab': None})  # no row published (Wyoming 812220)
    return {'all': d['8122']['revenue'], 'homes': d['812210']['revenue'], 'cemeteries': d['812220']['revenue'],
            'estabHomes': d['812210']['estab'], 'estabCemeteries': d['812220']['estab'], 'estab': d['8122']['estab'],
            'deathsEst2022': dd[0], 'deathsEst2023': dd[1], 'pop2022': dd[2]}
dc = {'source': 'U.S. Census Bureau, 2022 Economic Census, table EC2281BASIC (NAICS 8122, 812210, 812220, all establishments); '
                'U.S. Census Bureau, Vintage 2024 population estimates, NST-EST2024-ALLDATA (DEATHS2022 = 1 July 2021 to 30 June 2022, '
                'DEATHS2023 = 1 July 2022 to 30 June 2023).',
      'us': row('US'), 'states': {a: {'name': n, **row(f)} for a, n, f in STATES}}
json.dump(dc, open(os.path.join(OUT, 'death-care-2022.json'), 'w'), indent=0)

# 2. NCHS life tables (qx, ex by single year of age, 0 to 100).
import openpyxl
def table(url, name):
    p = fetch(url, name)
    ws = openpyxl.load_workbook(p, data_only=True).active
    qx, ex = [], []
    for r in ws.iter_rows(values_only=True):
        if isinstance(r[1], (int, float)) and isinstance(r[6], (int, float)) and isinstance(r[0], str) and r[0][:1].isdigit():
            qx.append(round(float(r[1]), 7)); ex.append(round(float(r[6]), 2))
    assert len(qx) == 101, (name, len(qx))
    return {'qx': qx, 'ex': ex}
lt = {'source': 'NCHS, United States Life Tables, 2024 (NVSR vol. 75 no. 5), and U.S. State Life Tables, 2022 (NVSR vol. 74 no. 12).',
      'us': {'m': table('https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/NVSR/75-05/Table02.xlsx', 'US2024-2.xlsx'),
             'f': table('https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/NVSR/75-05/Table03.xlsx', 'US2024-3.xlsx')},
      'states': {}}
for a, n, f in STATES:
    lt['states'][a] = {'m': table(f'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/NVSR/74-12/{a}2.xlsx', f'{a}2.xlsx'),
                       'f': table(f'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/NVSR/74-12/{a}3.xlsx', f'{a}3.xlsx')}
json.dump(lt, open(os.path.join(OUT, 'life-tables.json'), 'w'), separators=(',', ':'))

# 3. BLS CPI-U, U.S. city average, not seasonally adjusted (public API v1, 10 years per call).
cpi = {'CUUR0000SEGD02': {}, 'CUUR0000SA0': {}}
for start in (1986, 1996, 2006, 2016, 2026):
    body = json.dumps({'seriesid': list(cpi), 'startyear': str(start), 'endyear': str(min(start + 9, 2026)), 'annualaverage': True})
    p = fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', f'bls_{start}.json', post=body)
    d = json.load(open(p))
    assert d['status'] == 'REQUEST_SUCCEEDED', d
    for s in d['Results']['series']:
        for x in s['data']:
            if x['value'].replace('.', '', 1).isdigit():  # '-' = not published (October 2025, no collection during the shutdown)
                cpi[s['seriesID']][f"{x['year']}-{x['period']}"] = float(x['value'])
def series(k):
    v = cpi[k]
    monthly = {key.replace('-M', '-'): val for key, val in sorted(v.items()) if key[-3:] != 'M13'}
    annual = {key[:4]: val for key, val in sorted(v.items()) if key[-3:] == 'M13'}
    return {'monthly': monthly, 'annual': annual}
json.dump({'source': 'U.S. Bureau of Labor Statistics, CPI-U, U.S. city average, not seasonally adjusted: Funeral expenses (CUUR0000SEGD02, '
                     'base December 1986 = 100) and All items (CUUR0000SA0, base 1982-84 = 100).',
           'funeral': series('CUUR0000SEGD02'), 'all': series('CUUR0000SA0')}, open(os.path.join(OUT, 'cpi-funeral.json'), 'w'), indent=0)
print('ok: death-care', len(dc['states']), 'states; life tables', 2 + 2 * len(lt['states']), 'tables; CPI', len(cpi['CUUR0000SEGD02']), 'values')
