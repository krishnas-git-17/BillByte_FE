import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemImageService } from '../../services/menu-item-image.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';

@Component({
    standalone: true,
    selector: 'app-menu-images',
    templateUrl: './menu-images.component.html',
    styleUrls: ['./menu-images.component.scss'],
    imports: [CommonModule, PageHeaderComponent, FormsModule]
})
export class MenuImagesComponent {

    searchText: string = '';
    images: any[] = [];
    filteredImages: any[] = [];
    editIndex: number | null = null;
    editData: any = {};


    constructor(
        private imageService: MenuItemImageService,
        private loader: LoaderService,
        private cdr: ChangeDetectorRef
    ) {
        this.loadImages();
    }

    onSearch() {
        const text = this.searchText.toLowerCase().trim();

        this.filteredImages = this.images.filter(i =>
            i.itemName.toLowerCase().includes(text)
        );
    }

    loadImages() {
        this.loader.show();

        this.imageService.getAll().subscribe({
            next: (res) => {
                this.images = res;
                this.filteredImages = [...this.images];
                this.cdr.detectChanges();
            },
            error: () => {
                this.loader.hide();
            },
            complete: () => {
                this.loader.hide();
            }
        });
    }

    cleanName(name: string): string {
        return name.replace(/\.[^/.]+$/, "");
    }

    onSingleFile(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const itemName = this.cleanName(file.name);

        if (this.images.some(x => x.itemName === itemName)) return;

        this.loader.show();

        const reader = new FileReader();
        reader.onload = () => {
            const data = {
                itemName,
                itemImage: reader.result as string
            };

            this.imageService.create(data).subscribe({
                next: () => this.loadImages(),
                complete: () => this.loader.hide()
            });
        };

        reader.readAsDataURL(file);
    }

    importFolder(event: any) {
        const files: FileList = event.target.files;

        this.loader.show();

        let uploadCount = 0;
        const totalFiles = files.length;

        Array.from(files).forEach((file: any) => {
            const itemName = this.cleanName(file.name);

            if (this.images.some(x => x.itemName === itemName)) {
                uploadCount++;
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const data = {
                    itemName,
                    itemImage: reader.result as string
                };

                this.imageService.create(data).subscribe({
                    next: () => { },
                    complete: () => {
                        uploadCount++;
                        if (uploadCount === totalFiles) {
                            this.loadImages();
                            this.loader.hide();
                        }
                    }
                });
            };

            reader.readAsDataURL(file);
        });
    }

    edit(item: any) {
        const newName = prompt("Enter new name:", item.itemName);
        if (!newName) return;

        const cleaned = this.cleanName(newName);

        const updated = {
            itemName: cleaned,
            itemImage: item.itemImage
        };

        this.loader.show();

        this.imageService.update(item.id, updated).subscribe({
            next: () => this.loadImages(),
            complete: () => this.loader.hide()
        });
    }
    onEditImage(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            this.editData.itemImage = reader.result as string;
        };

        reader.readAsDataURL(file);
    }


    enableEdit(item: any, index: number) {
        this.editIndex = index;

        this.editData = {
            id: item.id,
            itemName: item.itemName,
            itemImage: item.itemImage
        };
    }
    cancelEdit() {
        this.editIndex = null;
        this.editData = {};
    }

    saveEdit(item: any) {

        const updated = {
            itemName: this.editData.itemName,
            itemImage: this.editData.itemImage
        };

        this.loader.show();

        this.imageService.update(item.id, updated).subscribe({
            next: () => {
                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    timer: 1200,
                    showConfirmButton: false
                });

                this.editIndex = null;
                this.loadImages();
            },
            error: () => {
                this.loader.hide();
                Swal.fire("Error", "Failed to update item", "error");
            }
        });
    }

    delete(item: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${item.itemName}" image?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#e63946'
        }).then(result => {

            if (result.isConfirmed) {

                this.loader.show();

                this.imageService.delete(item.id).subscribe({
                    next: (res) => {
                        // Even if API returns 204, this will run
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            timer: 1200,
                            showConfirmButton: false
                        });

                        this.loadImages();
                    },
                    error: (err) => {
                        if (err.status === 200 || err.status === 204) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                timer: 1200,
                                showConfirmButton: false
                            });

                            this.loadImages();
                            return;
                        }

                        this.loader.hide();
                        Swal.fire("Error", "Failed to delete image", "error");
                    }
                });


            }
        });
    }

}
