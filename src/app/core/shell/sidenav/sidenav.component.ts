/** Angular Imports */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';

/** rxjs Imports */
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/** Custom Components */
import { KeyboardShortcutsDialogComponent } from 'app/shared/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';

/** Custom Imports */
import { frequentActivities } from './frequent-activities';

type DoreSection = 'workspace' | 'customers' | 'channels' | 'controls' | 'administration';

/**
 * Dore two-level navigation component.
 *
 * The first rail selects a functional area; the second rail contains the
 * permission-filtered links for that area. This mirrors the supplied Dore
 * main-menu/sub-menu pattern without changing Bancro route contracts.
 */
@Component({
  selector: 'mifosx-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {

  @Input() sidenavCollapsed: boolean;

  username = '';
  officeName = '';
  userActivity: string[];
  mappedActivities: any[] = [];
  frequentActivities: any[] = frequentActivities;
  selectedSection: DoreSection = 'workspace';
  selectedSectionTitle = 'Workspace';
  private userPermissions: string[] = [];
  private routerEvents$: Subscription;

  constructor(private router: Router,
              public dialog: MatDialog,
              private authenticationService: AuthenticationService) {
    this.userActivity = JSON.parse(localStorage.getItem('mifosXLocation') || '[]');
  }

  ngOnInit() {
    const credentials = this.authenticationService.getCredentials() || {} as any;
    this.username = credentials.username || '';
    this.officeName = credentials.officeName || '';
    this.userPermissions = credentials.permissions || [];
    this.setMappedAcitivites();
    this.syncSectionWithRoute(this.router.url);
    this.routerEvents$ = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.syncSectionWithRoute(event.urlAfterRedirects));
  }

  ngOnDestroy() {
    if (this.routerEvents$) {
      this.routerEvents$.unsubscribe();
    }
  }

  selectSection(section: DoreSection) {
    this.selectedSection = section;
    this.selectedSectionTitle = this.sectionTitle(section);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (this.userPermissions.includes('ALL_FUNCTIONS')) {
      return true;
    }
    return permissions.some(permission => {
      if (this.userPermissions.includes(permission)) {
        return true;
      }
      return permission.indexOf('READ_') === 0 && this.userPermissions.includes('ALL_FUNCTIONS_READ');
    });
  }

  logout() {
    this.authenticationService.logout()
      .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  help() {
    window.open('https://mifosforge.jira.com/wiki/spaces/docs/pages/52035622/User+Manual', '_blank');
  }

  showKeyboardShortcuts() {
    const dialogRef = this.dialog.open(KeyboardShortcutsDialogComponent);
    dialogRef.afterClosed().subscribe(() => {});
  }

  getFrequentActivities() {
    const frequencyCounts: any = {};
    let index = this.userActivity.length;
    while (index) {
      frequencyCounts[this.userActivity[--index]] = (frequencyCounts[this.userActivity[index]] || 0) + 1;
    }
    return Object.entries(frequencyCounts)
      .sort((a: any, b: any) => b[1] - a[1])
      .map((entry: any[]) => entry[0])
      .filter((activity: string) => !['/', '/login', '/home', '/dashboard'].includes(activity))
      .slice(0, 3);
  }

  setMappedAcitivites() {
    const activities: string[] = this.getFrequentActivities();
    activities.forEach((activity: string) => {
      if (activity.includes('/clients')) {
        this.pushActivity('/clients');
      } else if (activity.includes('/groups')) {
        this.pushActivity('/groups');
      } else if (activity.includes('/centers')) {
        this.pushActivity('/centers');
      } else if (activity.includes('/accounting')) {
        this.pushActivity('/accounting');
      } else if (activity.includes('/reports')) {
        this.pushActivity('/reports');
      } else if (activity.includes('/users') || activity.includes('/appusers')) {
        this.pushActivity('/users');
      } else if (activity.includes('/organization')) {
        this.pushActivity('/organization');
      } else if (activity.includes('/system')) {
        this.pushActivity('/system');
      } else if (activity.includes('/products')) {
        this.pushActivity('/products');
      } else if (activity.includes('/templates')) {
        this.pushActivity('/templates');
      } else if (activity.includes('/self-service')) {
        this.pushActivity('/self-service');
      } else if (activity.includes('/data-import')) {
        this.pushActivity('/data-import');
      }
    });
    this.mappedActivities.reverse();
  }

  pushActivity(path: string) {
    const activity = this.frequentActivities.find((entry: any) => entry.path === path);
    if (activity && !this.mappedActivities.includes(activity)) {
      this.mappedActivities.push(activity);
    }
  }

  private syncSectionWithRoute(url: string) {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    let section: DoreSection = 'workspace';

    if (cleanUrl.startsWith('/teller-workstation') ||
        cleanUrl.startsWith('/payments') ||
        cleanUrl.startsWith('/reconciliation') ||
        cleanUrl.startsWith('/operations/teller') ||
        cleanUrl.startsWith('/operations/transfers') ||
        cleanUrl.startsWith('/operations/cards') ||
        cleanUrl.startsWith('/operations/pos') ||
        cleanUrl.startsWith('/organization/tellers')) {
      section = 'channels';
    } else if (cleanUrl === '/operations' ||
               cleanUrl.startsWith('/operations/approvals') ||
               cleanUrl.startsWith('/operations/integrations') ||
               cleanUrl.startsWith('/activity-trail')) {
      section = 'controls';
    } else if (cleanUrl.startsWith('/appusers') ||
               cleanUrl.startsWith('/users') ||
               cleanUrl.startsWith('/organization') ||
               cleanUrl.startsWith('/system') ||
               cleanUrl.startsWith('/reports') ||
               cleanUrl.startsWith('/templates') ||
               cleanUrl.startsWith('/data-import') ||
               cleanUrl.startsWith('/self-service')) {
      section = 'administration';
    } else if (cleanUrl.startsWith('/clients') ||
               cleanUrl.startsWith('/groups') ||
               cleanUrl.startsWith('/centers') ||
               cleanUrl.startsWith('/accounting') ||
               cleanUrl.startsWith('/products') ||
               cleanUrl.startsWith('/loans') ||
               cleanUrl.startsWith('/savings') ||
               cleanUrl.startsWith('/fixed-deposit') ||
               cleanUrl.startsWith('/recurring-deposit') ||
               cleanUrl.startsWith('/shares') ||
               cleanUrl.startsWith('/account-transfers') ||
               cleanUrl.startsWith('/collections')) {
      section = 'customers';
    }

    this.selectSection(section);
  }

  private sectionTitle(section: DoreSection): string {
    switch (section) {
      case 'customers': return 'Customer Banking';
      case 'channels': return 'Branch & Channels';
      case 'controls': return 'Controls & Operations';
      case 'administration': return 'Administration';
      default: return 'Workspace';
    }
  }
}
