import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemAddComponent } from '../menu-item-add.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
    selector: 'app-menu-items',
    standalone: true,
    imports: [CommonModule, FormsModule, MenuItemAddComponent],
    templateUrl: './menu-items.component.html',
    styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

    searchText = '';
    filteredItems: any[] = [];
    items: any[] = [];
    showAddPopup = false;
    showExportPopup = false;
    editIndex: number | null = null;
    tempEditData: any = {};
    ngOnInit(): void {
        this.loadItems();
    }
    toggleExportPopup() {
        this.showExportPopup = !this.showExportPopup;
    }
    loadItems() {
        const data = localStorage.getItem('menu_items');
        this.items = data ? JSON.parse(data) : [];
        this.filteredItems = [...this.items];
    }

    onSearch() {
        const text = this.searchText.toLowerCase().trim();

        if (!text) {
            this.filteredItems = [...this.items];
            return;
        }

        this.filteredItems = this.items.filter(item =>
            item.menuId.toLowerCase().includes(text) ||
            item.name.toLowerCase().includes(text) ||
            item.type.toLowerCase().includes(text) ||
            item.vegType.toLowerCase().includes(text) ||
            item.status.toLowerCase().includes(text)
        );
    }
    selectSuggestion(item: any) {
        this.searchText = item.name;
        this.filteredItems = [item]; // show only selected
    }


    saveNewItem(data: any) {
        const list = JSON.parse(localStorage.getItem("menu_items") || "[]");
        list.push(data);
        localStorage.setItem("menu_items", JSON.stringify(list));



        this.loadItems();
        this.showAddPopup = false;
    }


    importExcel(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e: any) => {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const excelData: any[] = XLSX.utils.sheet_to_json(sheet);

            const oldData = JSON.parse(localStorage.getItem('menu_items') || '[]');

            const finalData = [...oldData, ...excelData];

            localStorage.setItem('menu_items', JSON.stringify(finalData));

            this.items = finalData;
            this.filteredItems = finalData;

            alert('Excel Imported Successfully!');
        };

        reader.readAsBinaryString(file);
    }


    exportExcel() {
        const items = this.items;
        const headers = ["Menu ID", "Name", "Type", "VegType", "Status", "Price"];

        const rows = items.map(i => [
            i.menuId, i.name, i.type, i.vegType, i.status, i.price
        ]);

        let csv = headers.join(",") + "\n";

        rows.forEach(r => {
            csv += r.join(",") + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "menu_items.xlsx"; // Excel compatible
        link.click();

        this.showExportPopup = false;
    }

 exportPDF() {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Menu Items', 14, 15);

  const tableData = this.items.map(item => [
    item.menuId,
    item.name,
    item.type,
    item.vegType,
    item.status,
    item.price
  ]);

  autoTable(doc, {
    startY: 25,
    head: [['Menu ID', 'Name', 'Type', 'Veg/Non-Veg', 'Status', 'Price']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 143, 46] } // orange header
  });

  doc.save('menu_items.pdf');
  this.showExportPopup = false;
}


    enableEdit(i: number) {
        this.editIndex = i;
        this.tempEditData = { ...this.filteredItems[i] };
    }

    saveEdit(i: number) {
        this.filteredItems[i] = { ...this.tempEditData };

        const realIndex = this.items.findIndex(x => x.menuId === this.tempEditData.menuId);
        this.items[realIndex] = { ...this.tempEditData };

        localStorage.setItem("menu_items", JSON.stringify(this.items));

        this.editIndex = null;
    }

    cancelEdit() {
        this.editIndex = null;
        this.tempEditData = {};
    }
    deleteItem(item: any) {
        this.items = this.items.filter(x => x.menuId !== item.menuId);

        this.filteredItems = this.filteredItems.filter(x => x.menuId !== item.menuId);

        localStorage.setItem("menu_items", JSON.stringify(this.items));
    }
}
