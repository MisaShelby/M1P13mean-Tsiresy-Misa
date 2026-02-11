import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    show: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications = signal<Notification[]>([]);
    private currentId = 0;

    getNotifications = this.notifications.asReadonly();

    /**
     * Afficher une notification de succès
     */
    success(message: string, title: string = 'Succès'): void {
        this.addNotification({
            type: 'success',
            title,
            message,
            duration: 5000
        });
    }

    /**
     * Afficher une notification d'erreur
     */
    error(message: string, title: string = 'Erreur'): void {
        this.addNotification({
            type: 'error',
            title,
            message,
            duration: 7000
        });
    }

    /**
     * Afficher une notification d'avertissement
     */
    warning(message: string, title: string = 'Attention'): void {
        this.addNotification({
            type: 'warning',
            title,
            message,
            duration: 6000
        });
    }

    /**
     * Afficher une notification d'information
     */
    info(message: string, title: string = 'Information'): void {
        this.addNotification({
            type: 'info',
            title,
            message,
            duration: 4000
        });
    }

    /**
     * Ajouter une notification
     */
    private addNotification(notification: Omit<Notification, 'id' | 'show'>): void {
        const id = ++this.currentId;
        const newNotification: Notification = {
            id,
            show: true,
            ...notification
        };

        this.notifications.update(notifs => [...notifs, newNotification]);

        if (newNotification.duration) {
            setTimeout(() => {
                this.removeNotification(id);
            }, newNotification.duration);
        }
    }

    removeNotification(id: number): void {
        this.notifications.update(notifs =>
            notifs.map(notif =>
                notif.id === id ? { ...notif, show: false } : notif
            )
        );

        setTimeout(() => {
            this.notifications.update(notifs =>
                notifs.filter(notif => notif.id !== id)
            );
        }, 300);
    }

    clearAll(): void {
        this.notifications.update(notifs =>
            notifs.map(notif => ({ ...notif, show: false }))
        );

        setTimeout(() => {
            this.notifications.set([]);
        }, 300);
    }
}