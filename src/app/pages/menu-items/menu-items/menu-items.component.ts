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
import { SnackbarComponent } from '../../../layout/components/snackbar.component';
import { MenuItemImageService } from '../../../services/menu-item-image.service';
import { NgZone } from '@angular/core';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-menu-items',
    standalone: true,
    imports: [CommonModule, FormsModule, MenuItemAddComponent, SnackbarComponent],
    templateUrl: './menu-items.component.html',
    styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

    constructor
    (private menuService: MenuItemsService, 
        private imageService: MenuItemImageService,
        private zone: NgZone,
         private cdr: ChangeDetectorRef) { }

    loading = true;
    
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
  console.log('MenuItemsComponent INIT');
  this.loadItems();
}


    showSnackbar(msg: string) {
        this.snackMessage = msg;
        this.showSnack = true;

        setTimeout(() => (this.showSnack = false), 2500);
    }
  loadItems() {
  this.loading = true;
  this.cdr.detectChanges(); // 👈 show skeleton immediately

  this.menuService.getAll().subscribe({
    next: res => {
      this.items = res;
      this.filteredItems = [...res];
      this.loading = false;
      this.cdr.detectChanges(); // 👈 show data immediately
    },
    error: err => {
      console.error(err);
      this.loading = false;
      this.cdr.detectChanges();
      Swal.fire("Error", "Failed to load items", "error");
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

    createMenuItemFinal(data: any) {
        this.menuService.createMenuItem(data).subscribe(() => {
            this.loadItems();
            this.showAddPopup = false;
            this.showSnackbar("Item Added Successfully!");
        });
    }

    saveNewItem(data: any) {

        if (data.imageUrl && data.imageUrl !== "" && data.imageUrl !== null) {
            this.createMenuItemFinal(data);
            return;
        }

        this.imageService.getAll().subscribe(imgList => {

            const match = imgList.find(x =>
                x.itemName.toLowerCase() === data.name.toLowerCase()
            );

            if (match) {
                data.imageUrl = match.itemImage;
            }

            this.createMenuItemFinal(data);
        });
    }

importExcel(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  this.loading = true;

  const reader = new FileReader();

  reader.onload = () => {

    const workbook = XLSX.read(reader.result, { type: 'binary' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelRows: any[] = XLSX.utils.sheet_to_json(sheet);

    // ❌ EMPTY EXCEL
    if (excelRows.length === 0) {
      this.zone.run(() => this.loading = false);
      Swal.fire("No Data", "Excel file is empty.", "warning");
      return;
    }

    this.imageService.getAll().subscribe(imgList => {

      const newItems: any[] = [];
      const skippedItems: string[] = [];

      excelRows.forEach(row => {
        const menuId = row.MenuId || row.menuId;
        const name = (row.Name ?? row.name ?? '').toString().trim();
        if (!menuId || !name) return;

        if (this.items.some(x => x.menuId === menuId)) {
          skippedItems.push(menuId);
          return;
        }

        const matchedImg = imgList.find(img =>
          img?.itemName?.toLowerCase() === name.toLowerCase()
        );

        newItems.push({
          menuId,
          name,
          type: row.Type || '',
          vegType: row.VegType || 'Veg',
          status: row.Status || 'Available',
          price: Number(row.Price || 0),
          imageUrl: matchedImg ? matchedImg.itemImage : null
        });
      });

     if (newItems.length === 0) {
  this.loading = false; // ✅ STOP LOADER
  Swal.fire("No New Items", "All records already exist.", "info");
  return;
}


      const apiCalls = newItems.map(i => this.menuService.createMenuItem(i));

     forkJoin(apiCalls)
  .pipe(
    finalize(() => {
      this.loading = false;
    })
  )
  .subscribe({
    next: () => {
      Swal.fire("Success!", "Imported successfully!", "success");
      this.loadItems();
    },
    error: () => {
      Swal.fire("Error", "Failed to import records.", "error");
    }
  });

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
            head: [['S.No', 'Menu ID', 'Name', 'Type', 'Veg/Non-Veg', 'Status', 'Price']],
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
       this.loading = true;
        this.menuService.deleteMenuItem(item.menuId).subscribe({
            next: () => {
                this.loadItems();
            },
            error: () => {
                Swal.fire("Error", "Failed to delete item", "error");
            },
            complete: () => {
this.loading = false;

            }
        });
    }








}
