document.getElementById('upload').addEventListener('change', handleFileUpload);
document.getElementById('download').addEventListener('click', downloadEditedData);

let workbook; // Excelデータを保存する変数

function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, { type: 'array' });
        displayData();
    };

    reader.readAsArrayBuffer(file);
}

function displayData() {
    const sheetName = workbook.SheetNames[0]; // 最初のシートを選択
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const container = document.getElementById('table-container');
    container.innerHTML = ''; // 前のデータをクリア

    const table = document.createElement('table');
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.contentEditable = true; // 編集可能にする
            td.textContent = cell || ''; // 空セルの場合に対応
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    container.appendChild(table);
}

function downloadEditedData() {
    const table = document.querySelector('table');
    const data = [];
    table.querySelectorAll('tr').forEach((row) => {
        const rowData = [];
        row.querySelectorAll('td').forEach((cell) => {
            rowData.push(cell.textContent);
        });
        data.push(rowData);
    });

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'EditedSheet');
    XLSX.writeFile(newWorkbook, 'edited_data.xlsx');
}

 // ESCキーでサイトに戻る
 window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});