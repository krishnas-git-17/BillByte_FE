import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemAddComponent } from '../menu-item-add.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { forkJoin } from 'rxjs';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { MenuItemsService } from '../../../services/menu-items.service';
import { LoaderService } from '../../../services/loader.service';
import { SnackbarComponent } from '../../../layout/components/snackbar.component';

@Component({
    selector: 'app-menu-items',
    standalone: true,
    imports: [CommonModule, FormsModule, MenuItemAddComponent,SnackbarComponent],
    templateUrl: './menu-items.component.html',
    styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

    constructor(private menuService: MenuItemsService, private loader: LoaderService, private cdr: ChangeDetectorRef) { }

    showSnack = false;
    snackMessage = "";
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

 showSnackbar(msg: string) {
        this.snackMessage = msg;
        this.showSnack = true;

        setTimeout(() => (this.showSnack = false), 2500);
    }    
    loadItems() {
        this.loader.show();

        this.menuService.getAll().subscribe({
            next: (res: any) => {
                this.items = res;
                this.filteredItems = [...this.items];
            },
            error: (err) => {
                console.error(err);
                Swal.fire("Error", "Failed to load items", "error");
            },
            complete: () => {
                this.loader.hide();
            }
        });
    }

    toggleExportPopup() {
        this.showExportPopup = !this.showExportPopup;
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
        this.filteredItems = [item];
    }


    saveNewItem(data: any) {
        this.menuService.createMenuItem(data).subscribe(() => {
            this.loadItems();
            this.showAddPopup = false;
        });
    }

    importExcel(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.loader.show();

        const reader = new FileReader();

        reader.onload = (e: any) => {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelRows: any[] = XLSX.utils.sheet_to_json(sheet);

            if (excelRows.length === 0) {
                this.loader.hide();
                Swal.fire("No Data", "Excel file is empty.", "warning");
                return;
            }

            const newItems: Array<{
                menuId: string;
                name: string;
                type: string;
                vegType: string;
                status: string;
                price: number;
                imageUrl?: string | null;
                createdBy: string;
            }> = [];

            const skippedItems: string[] = [];


            excelRows.forEach(row => {
                const menuId = row.MenuId || row.menuId;

                const exists = this.items.some(x => x.menuId === menuId);

                if (exists) {
                    skippedItems.push(menuId);
                } else {
                    newItems.push({
                        menuId: menuId,
                        name: row.Name || row.name,
                        type: row.Type || row.type,
                        vegType: row.VegType || row.vegType,
                        status: row.Status || row.status,
                        price: row.Price || row.price,
                        imageUrl: row.ImageUrl || null,
                        createdBy: "Excel Import"
                    });
                }
            });

            if (newItems.length === 0) {
                this.loader.hide();
                Swal.fire("No New Records", "All records already exist.", "info");
                return;
            }
            const apiCalls = newItems.map(item => this.menuService.createMenuItem(item));

            forkJoin(apiCalls).subscribe({
                next: () => {
                    this.loader.hide();

                    let message = "Imported successfully!";

                    if (skippedItems.length > 0) {
                        message += `\nSkipped ${skippedItems.length} duplicate record(s).`;
                    }

                    Swal.fire("Success!", message, "success");

                    this.loadItems();
                },
                error: () => {
                    this.loader.hide();
                    Swal.fire("Error", "Failed to import records.", "error");
                }
            });
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
        link.download = "menu_items.xlsx";
        link.click();

        this.showExportPopup = false;
    }

    exportPDF() {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Menu Items', 14, 15);

        const tableData = this.items.map((item, index) => [
             index + 1,     
            item.menuId,
            item.name,
            item.type,
            item.vegType,
            item.status,
            item.price
        ]);

        autoTable(doc, {
            startY: 25,
            head: [['S.No','Menu ID', 'Name', 'Type', 'Veg/Non-Veg', 'Status', 'Price']],
            body: tableData,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [255, 143, 46] }
        });

        doc.save('menu_items.pdf');
        this.showExportPopup = false;
    }


    enableEdit(i: number) {
        this.editIndex = i;
        this.tempEditData = { ...this.filteredItems[i] };
    }

    saveEdit(i: number) {
        const updated = { ...this.tempEditData };

        this.menuService.updateMenuItem(updated.menuId, updated).subscribe(() => {
            const mainIndex = this.items.findIndex(x => x.menuId === updated.menuId);
            if (mainIndex !== -1) {
                this.items[mainIndex] = { ...updated };
            }
            this.filteredItems[i] = { ...updated };
            // this.editIndex = null;
            // this.cdr.detectChanges();
            setTimeout(() => {
                this.editIndex = null;
                this.cdr.detectChanges();
            }, 200); 
           this.showSnackbar("Updated successfully!");
        });
    }


    cancelEdit() {
        this.editIndex = null;
        this.tempEditData = {};
    }
    trackByMenuId(index: number, item: any) {
        return item.menuId;
    }

    deleteConfirm(item: any) {

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${item.name}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#e63946'
        }).then(result => {

            if (result.isConfirmed) {
                this.deleteItem(item);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    timer: 1200,
                    showConfirmButton: false
                });
            }

        });
    }


    deleteItem(item: any) {
        this.loader.show();
        this.menuService.deleteMenuItem(item.menuId).subscribe({
            next: () => {
                this.loadItems();
            },
            error: () => {
                Swal.fire("Error", "Failed to delete item", "error");
            },
            complete: () => {
                this.loader.hide();
            }
        });
    }








}
