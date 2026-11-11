"""Refresh the browser dataset from the neighboring source workbook."""
import json
from pathlib import Path
from openpyxl import load_workbook

base = Path(__file__).resolve().parent
source = base.parent / '프로그램별_재원_2026_2027.xlsx'
sheet = load_workbook(source, data_only=True)['프로그램별 재원']
keys = ['sector', 'account', 'group', 'program', 'y2026', 'y2027']
rows = []
for values in sheet.iter_rows(min_row=2, max_col=6, values_only=True):
    if not all(values[i] for i in range(4)):
        continue
    if not all(isinstance(values[i], (int, float)) for i in (4, 5)):
        raise ValueError(f'금액이 수치형이 아닙니다: {values[3]}')
    rows.append(dict(zip(keys, values)))
(base / 'data.js').write_text('window.BUDGET_DATA = ' + json.dumps(rows, ensure_ascii=False) + ';\n', encoding='utf-8')
print(f'{len(rows)}개 행 반영 완료')
