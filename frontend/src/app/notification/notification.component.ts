import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm">
      <div 
        *ngFor="let notification of notifications()"
        [class]="getNotificationClasses(notification)"
        [class.opacity-0]="!notification.show"
        [class.translate-x-full]="!notification.show"
        class="transform transition-all duration-300 ease-out shadow-lg rounded-lg p-4"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <ng-container [ngSwitch]="notification.type">
              <i *ngSwitchCase="'success'" class="pi pi-check-circle text-lg"></i>
              <i *ngSwitchCase="'error'" class="pi pi-times-circle text-lg"></i>
              <i *ngSwitchCase="'warning'" class="pi pi-exclamation-triangle text-lg"></i>
              <i *ngSwitchDefault class="pi pi-info-circle text-lg"></i>
            </ng-container>
          </div>

          <!-- Contenu -->
          <div class="ml-3 flex-1">
            <div class="font-medium">{{ notification.title }}</div>
            <div class="text-sm opacity-90 mt-1">{{ notification.message }}</div>
          </div>

          <!-- Bouton de fermeture -->
          <button 
            (click)="closeNotification(notification.id)"
            class="ml-4 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class NotificationComponent implements OnInit {
    private notificationService = inject(NotificationService);

    notifications = this.notificationService.getNotifications;

    constructor() { }

    ngOnInit(): void { }

    getNotificationClasses(notification: any): string {
        const baseClasses = 'border-l-4';

        switch (notification.type) {
            case 'success':
                return `${baseClasses} bg-green-50 text-green-800 border-green-500`;
            case 'error':
                return `${baseClasses} bg-red-50 text-red-800 border-red-500`;
            case 'warning':
                return `${baseClasses} bg-yellow-50 text-yellow-800 border-yellow-500`;
            case 'info':
                return `${baseClasses} bg-blue-50 text-blue-800 border-blue-500`;
            default:
                return `${baseClasses} bg-gray-50 text-gray-800 border-gray-500`;
        }
    }

    closeNotification(id: number): void {
        this.notificationService.removeNotification(id);
    }
}