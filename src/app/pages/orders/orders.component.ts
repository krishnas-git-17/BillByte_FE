import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuListComponent, MenuItem } from '../../layout/components/menu-list/menu-list.component';
import { TableStatusService } from '../../services/table-status.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CheckoutComponent } from '../../layout/components/checkout/checkout.component';
import { CompletedOrdersService } from '../../services/completed-orders.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, MenuListComponent, FormsModule, MatIconModule, CheckoutComponent],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss'
})

export class OrdersComponent implements AfterViewInit {


    @ViewChild(MenuListComponent)
    menuList!: MenuListComponent;

    tableId = '';
    tableType = '';
    searchText: string = "";
    cart: { [id: number]: MenuItem & { qty: number } } = {};
    quantities: { [id: number]: number } = {};
    isCheckoutMode = false;
    orderType: 'Dine' | 'Parcel' | 'Delivery' = 'Dine';
    discountPercent: number = 0;
    discountAmount: number = 0;
    isSubmitting = false;
    subtotal = 0;
    tax = 0;
    total = 0;

    isOccupied = false;



    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private tableStatus: TableStatusService,
        private completedOrders: CompletedOrdersService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        window.onbeforeunload = () => {
            if (this.cartCount > 0 && !this.isOccupied) {
                return "Unsaved order will be lost. Continue?";
            }
            return null;
        };
        this.isOccupied = false;
        this.isCheckoutMode = false;

        this.tableId = this.route.snapshot.params['tableId'];
        this.tableType = this.route.snapshot.params['type'];

        this.isOccupied = false;
        const saved = this.tableStatus.loadOrder(this.tableId);
        if (saved) {
            this.cart = saved.items || {};
            this.quantities = saved.quantities || {};
            this.subtotal = saved.subtotal || 0;
            this.tax = saved.tax || 0;
            this.total = saved.total || 0;
            this.isOccupied = saved.occupied ?? this.isOccupied;
            // this.isCheckoutMode = this.isOccupied;
        }
    }

    goBack() {
        if (this.cartCount > 0 && !this.isOccupied) {
            const confirmLeave = confirm(
                "You have unsaved items. If you go back, the order will be cleared. Proceed?"
            );

            if (!confirmLeave) return;

            this.cart = {};
            this.quantities = {};
            this.tableStatus.clearOrder(this.tableId);
        }

        this.location.back();
    }



    filterMenu(text: string) {
        this.searchText = text;
        this.menuList.searchText = text;
        this.menuList.applyFilters();
    }


    ngAfterViewInit() {
        setTimeout(() => {
            if (this.menuList) {
                this.menuList.quantities = { ...this.quantities };
            }
        });
    }

    onQuantityChange(ev: { item: MenuItem; qty: number }) {
        if (this.isCheckoutMode) return;
        const { item, qty } = ev;

        if (qty === 0) {
            delete this.cart[item.id];
        } else {
            this.cart[item.id] = { ...item, qty };
        }

        this.quantities = { ...this.quantities, [item.id]: qty };

        this.calculateTotals();
        this.saveOrder();
    }

    increaseQty(item: any) {
        const updatedQty = (this.quantities[item.id] || 0) + 1;
        this.onQuantityChange({ item, qty: updatedQty });
    }

    decreaseQty(item: any) {
        const updatedQty = (this.quantities[item.id] || 0) - 1;

        if (updatedQty <= 0) {
            this.removeFromCart(item.id);
            return;
        }

        this.onQuantityChange({ item, qty: updatedQty });
    }


    removeFromCart(id: number) {
        delete this.cart[id];

        this.quantities = { ...this.quantities, [id]: 0 };

        if (this.menuList) {
            this.menuList.resetQuantity(id);
        }

        this.calculateTotals();
        this.saveOrder();
    }

    calculateTotals() {
        this.subtotal = Object.values(this.cart).reduce((sum: any, item: any) =>
            sum + item.price * item.qty, 0);

        this.discountAmount = this.subtotal * (this.discountPercent / 100);

        const afterDiscount = this.subtotal - this.discountAmount;

        this.tax = Math.round(afterDiscount * 0.05); 

        this.total = afterDiscount + this.tax;
    }


    saveOrder() {
        this.tableStatus.saveOrder(this.tableId, {
            items: this.cart,
            quantities: this.quantities,
            subtotal: this.subtotal,
            tax: this.tax,
            total: this.total,
            occupied: this.isOccupied
        });
    }

    onProceedClick() {
        if (this.isOccupied) return;

        console.log('[Orders] Proceed clicked → START table', this.tableId);

        this.isOccupied = true;
        this.isCheckoutMode = false;

        this.tableStatus.startTable(this.tableId).subscribe({
            next: () => {
                // console.log('[Orders] Table STARTED in backend');
                this.saveOrder();
            },
            error: err => {
                // console.error('[Orders] Failed to start table', err);
                this.isOccupied = false;
            }
        });
    }


    checkout() {
        this.isCheckoutMode = true;
    }


    completeOrder() {
        this.isOccupied = false;
        this.isCheckoutMode = false;

        this.tableStatus.stopTable(this.tableId).subscribe({
            next: () => {
                this.tableStatus.markAvailable(this.tableId);

                this.cart = {};
                this.quantities = {};
                this.subtotal = this.tax = this.total = 0;
                this.discountPercent = 0;

                if (this.menuList) {
                    this.menuList.applyFilters();
                }

                this.tableStatus.clearOrder(this.tableId);
                this.cdr.detectChanges();

                this.router.navigate(['/dashboard']);
            },
            error: err => {
                console.error('Failed to stop table', err);
            }
        });
    }





    get proceedLabel() {
        return this.isOccupied ? 'Complete Order' : 'Proceed';
    }
    get cartCount(): number {
        return this.cart ? Object.keys(this.cart).length : 0;
    }



    onCheckoutComplete(ev: { paymentMode: 'CASH' | 'CARD' | 'UPI' }) {

        const timers = JSON.parse(localStorage.getItem('table_timers') || '{}');
        const startTime = timers[this.tableId];
        const tableTimeMinutes = startTime
            ? Math.floor((Date.now() - startTime) / 60000)
            : 0;

        const items = Object.values(this.cart).map((item: any) => ({
            itemName: item.name, 
            price: item.price,
            qty: item.qty
        }));

        const orderData = {
            tableId: this.tableId,
            orderType: this.orderType,
            subtotal: this.subtotal,
            tax: this.tax,
            discount: this.discountPercent,
            total: this.total,
            paymentMode: ev.paymentMode,
            tableTimeMinutes,   
            items              
        };

        this.completedOrders.saveOrder(orderData).subscribe({
            next: () => {
                // console.log('API SUCCESS');
                this.completeOrder();
            },
            error: err => {
                // console.log('API FAILED');
            }
        });
    }




}
