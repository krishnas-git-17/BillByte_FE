import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexPlotOptions,
    ApexDataLabels,
    ApexStroke,
    ApexFill,
    ApexMarkers,
    ApexGrid
} from 'ng-apexcharts';

@Component({
    selector: 'app-reports-charts',
    standalone: true,
    imports: [CommonModule, NgApexchartsModule],
    templateUrl: './reports-charts.component.html',
    styleUrls: ['./reports-charts.component.scss']
})
export class ReportsChartsComponent implements OnChanges {

    @Input() orders: any[] = [];
    chartRange: 'week' | 'month' = 'week';

    orderActivitySeries: ApexAxisChartSeries = [];
    ordersTrendSeries: ApexAxisChartSeries = [];

    dayAxis: ApexXAxis = { categories: [] };

    barChart: ApexChart = {
        type: 'bar',
        height: '100%',
        toolbar: { show: false }
    };

    areaChart: ApexChart = {
        type: 'area',
        height: '100%',
        toolbar: { show: false },
        zoom: { enabled: false }
    };

    barPlotOptions: ApexPlotOptions = {
        bar: {
            borderRadius: 8,
            columnWidth: '40%'
        }
    };

    barDataLabels: ApexDataLabels = {
        enabled: true,
        style: {
            fontSize: '12px',
            fontWeight: 700,
            colors: ['#fff']
        }
    };

    barGrid: ApexGrid = {
        borderColor: '#e5e7eb',
        strokeDashArray: 4
    };

    areaStroke: ApexStroke = {
        curve: 'smooth',
        width: 3,
        colors: ['#fb923c']
    };

    areaFill: ApexFill = {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 90, 100],
            colorStops: [
                { offset: 0, color: '#fb923c', opacity: 0.4 },
                { offset: 100, color: '#fb923c', opacity: 0 }
            ]
        }
    };

    areaGrid: ApexGrid = {
        borderColor: '#e5e7eb',
        strokeDashArray: 4
    };
    ngOnChanges(): void {
        if (this.orders?.length) {
            this.buildCharts();
        }
    }

    private getDateRange(): string[] {
        const dates: string[] = [];
        const today = new Date();

        if (this.chartRange === 'week') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                dates.push(d.toISOString().split('T')[0]);
            }
        }

        if (this.chartRange === 'month') {
            const daysInMonth = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
            ).getDate();

            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(today.getFullYear(), today.getMonth(), d);
                dates.push(date.toISOString().split('T')[0]);
            }
        }

        return dates;
    }


    private buildCharts(): void {
        this.buildOrderActivity();
        this.buildOrdersTrend();
    }

    buildOrderActivity() {
        const days = this.getDateRange();

        const counts = days.map(date =>
            this.orders.filter(o =>
                o.createdDate.startsWith(date)
            ).length
        );

        this.orderActivitySeries = [
            { name: 'Orders', data: counts }
        ];

        this.dayAxis = {
            categories: days.map(d => d.slice(5)),
            labels: { style: { fontSize: '11px' } }
        };
    }


    buildOrdersTrend() {
        const days = this.getDateRange();

        const revenueTrend = days.map(date =>
            this.orders
                .filter(o => o.createdDate.startsWith(date))
                .reduce((sum, o) => sum + o.total, 0)
        );

        this.ordersTrendSeries = [
            { name: 'Revenue', data: revenueTrend }
        ];

    }


}
