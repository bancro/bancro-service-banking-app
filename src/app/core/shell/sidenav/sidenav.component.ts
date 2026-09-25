/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';

/** Custom Components */
import { KeyboardShortcutsDialogComponent } from 'app/shared/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';

/** Custom Services */
import { AuthenticationService } from '../../authentication/authentication.service';

/** Custom Imports */
import { frequentActivities } from './frequent-activities';

/**
 * Sidenav component.
 */
@Component({
  selector: 'mifosx-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  /** True if sidenav is in collapsed state. */
  @Input() sidenavCollapsed: boolean;

  /** Username of authenticated user. */
  username: string;
  officeName: string;
  /** Array of all user activities */
  userActivity: string[];
  /** Mapped Activites */
  mappedActivities: any[] = [];
  /** Collection of possible frequent activities */
  frequentActivities: any[] = frequentActivities;
  activeSection = 'workspace';
  reportsOpenState = true;

  /**
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Mat Dialog
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(private router: Router,
              public dialog: MatDialog,
              private authenticationService: AuthenticationService) {
    const storedActivity = localStorage.getItem('mifosXLocation');
    this.userActivity = storedActivity ? JSON.parse(storedActivity) : [];
  }

  /**
   * Sets the username of the authenticated user.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials?.staffDisplayName || credentials?.username || 'User';
    this.officeName = credentials?.officeName || '';
    this.setMappedAcitivites();
    this.syncSectionWithRoute(this.router.url);
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.syncSectionWithRoute(event.urlAfterRedirects || event.url);
      }
    });
  }

  selectSection(section: string) {
    this.activeSection = section;
    if (section === 'control') {
      this.reportsOpenState = true;
    }
  }

  toggleReports() {
    this.reportsOpenState = !this.reportsOpenState;
  }

  isReportsRoute() {
    return this.router.url.startsWith('/reports') || this.router.url.startsWith('/xbrl');
  }

  private syncSectionWithRoute(url: string) {
    if (url.startsWith('/clients') || url.startsWith('/groups') || url.startsWith('/centers')) {
      this.activeSection = 'customer';
      return;
    }
    if (url.startsWith('/teller-workstation') || url.startsWith('/payments') || url.startsWith('/reconciliation') ||
        url.startsWith('/organization/tellers')) {
      this.activeSection = 'branch';
      return;
    }
    if (url.startsWith('/self-service')) {
      this.activeSection = 'self-service';
      return;
    }
    if (url.startsWith('/accounting') || url.startsWith('/reports') || url.startsWith('/xbrl') ||
        url.startsWith('/operations') || url.startsWith('/activity-trail') || url.startsWith('/appusers') ||
        url.startsWith('/organization') || url.startsWith('/products') || url.startsWith('/system') ||
        url.startsWith('/templates') || url.startsWith('/settings')) {
      this.activeSection = 'control';
      if (url.startsWith('/reports') || url.startsWith('/xbrl')) {
        this.reportsOpenState = true;
      }
      return;
    }
    this.activeSection = 'workspace';
  }

  /**
   * Logs out the authenticated user and redirects to login page.
   */
  logout() {
    this.authenticationService.logout()
      .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  /**
   * Opens Mifos JIRA Wiki page.
   */
  help() {
    window.open('https://mifosforge.jira.com/wiki/spaces/docs/pages/52035622/User+Manual', '_blank');
  }

  /**
   * Opens Keyboard shortcuts dialog.
   */
  showKeyboardShortcuts() {
    const dialogRef = this.dialog.open(KeyboardShortcutsDialogComponent);
    dialogRef.afterClosed().subscribe((response: any) => {});
  }

  /**
   * Returns top three frequent activities.
   */
  getFrequentActivities() {
    const frequencyCounts: any = {};
    let index = (this.userActivity || []).length;
    while (index) {
      frequencyCounts[this.userActivity[--index]] = (frequencyCounts[this.userActivity[index]] || 0) + 1;
    }
    const frequencyCountsArray = Object.entries(frequencyCounts);
    const topThreeFrequentActivities =
      frequencyCountsArray
        .sort((a: any, b: any) => b[1] - a[1])
        .map((entry: any[]) => entry[0])
        .filter((activity: string) => !['/', '/login', '/home', '/dashboard'].includes(activity))
        .slice(0, 3);
    return topThreeFrequentActivities;
  }

  /**
   * Maps frequently accessed urls to button objects.
   */
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
      } else if (activity.includes('/users')) {
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

  /**
   * Pushes activity to mapped activities
   * @param {string} path Activity Path
   */
  pushActivity(path: string) {
    const activity = this.frequentActivities.find((entry: any) => entry.path === path);
    if (!this.mappedActivities.includes(activity)) {
      this.mappedActivities.push(activity);
    }
  }

}
