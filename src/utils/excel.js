import * as XLSX from "xlsx";

const ws =
XLSX.utils.json_to_sheet(
 transactions
);

const wb =
XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
 wb,
 ws,
 "Finance"
);

XLSX.writeFile(
 wb,
 "Finance.xlsx"
);