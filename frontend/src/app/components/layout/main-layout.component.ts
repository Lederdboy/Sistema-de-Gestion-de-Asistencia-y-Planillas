import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopBarComponent } from './topbar.component';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopBarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <!-- Backdrop for mobile sidebar -->
      @if (isMobile() && isSidebarOpen()) {
        <div
          (click)="isSidebarOpen.set(false)"
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        ></div>
      }

      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="isSidebarOpen()"
        [isMobile]="isMobile()"
        (toggle)="toggleSidebar()"
      ></app-sidebar>

      <!-- TopBar -->
      <app-topbar
        [isSidebarOpen]="isSidebarOpen()"
        [isMobile]="isMobile()"
        [currentZoom]="viewZoom()"
        (toggleSidebar)="toggleSidebar()"
        (zoomChange)="onZoomChange($event)"
      ></app-topbar>

      <!-- Main Content Container with Zoom scale -->
      <main
        class="flex-1 pt-16 transition-all duration-300 min-h-screen"
        [ngClass]="{
          'pl-0': isMobile(),
          'pl-64': !isMobile() && isSidebarOpen(),
          'pl-16': !isMobile() && !isSidebarOpen()
        }"
      >
        <div
          class="p-4 sm:p-6 max-w-7xl mx-auto"
          [style.zoom]="viewZoom() !== 100 ? (viewZoom() / 100) : null"
        >
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Toast notifications -->
      <app-toast></app-toast>
    </div>
  `
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isMobile = signal<boolean>(false);
  isSidebarOpen = signal<boolean>(true);
  viewZoom = signal<number>(100);

  private resizeListener = () => this.handleResize();

  ngOnInit() {
    this.handleResize();
    window.addEventListener('resize', this.resizeListener);

    try {
      const savedZoom = localStorage.getItem('planilla_view_zoom');
      if (savedZoom) this.viewZoom.set(Number(savedZoom));
    } catch {}
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }

  private handleResize() {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile) {
      this.isSidebarOpen.set(false);
    } else {
      this.isSidebarOpen.set(true);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  onZoomChange(level: number) {
    this.viewZoom.set(level);
    try {
      localStorage.setItem('planilla_view_zoom', String(level));
    } catch {}
  }
}

