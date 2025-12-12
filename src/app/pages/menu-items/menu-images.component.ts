import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemImageService } from '../../services/menu-item-image.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
@Component({
    standalone: true,
    selector: 'app-menu-images',
    templateUrl: './menu-images.component.html',
    styleUrls: ['./menu-images.component.scss'],
    imports: [CommonModule, PageHeaderComponent]
})
export class MenuImagesComponent {

    images: any[] = [];

    constructor(private imageService: MenuItemImageService) {
        this.loadImages();
    }

    loadImages() {
        this.imageService.getAll().subscribe(res => {
            this.images = res;
            console.log(res);
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

        const reader = new FileReader();
        reader.onload = () => {
            const data = {
                itemName: itemName,
                itemImage: reader.result as string
            };

            this.imageService.create(data).subscribe(() => {
                this.loadImages();
            });
        };

        reader.readAsDataURL(file);
    }

    importFolder(event: any) {
        const files: FileList = event.target.files;

        Array.from(files).forEach((file: any) => {
            const itemName = this.cleanName(file.name);

            if (this.images.some(x => x.itemName === itemName)) return;

            const reader = new FileReader();
            reader.onload = () => {
                const data = {
                    itemName: itemName,
                    itemImage: reader.result as string
                };

                this.imageService.create(data).subscribe(() => {
                    this.loadImages();
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

        this.imageService.update(item.id, updated).subscribe(() => {
            this.loadImages();
        });
    }

    delete(item: any) {
        this.imageService.delete(item.id).subscribe(() => {
            this.loadImages();
        });
    }
}
