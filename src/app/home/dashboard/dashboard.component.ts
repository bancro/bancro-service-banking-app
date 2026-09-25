/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/** rxjs Imports */
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { HomeService } from '../home.service';

/**
 * Dashboard component.
 */
@Component({
  selector: 'mifosx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  /** Array of all user activities */
  userActivity: string[];
  /** Array of most recent user activities */
  recentActivities: string[];
  /** Array of most frequent user activities */
  frequentActivities: string[];

  /** Dore-style summary metrics. Values are sourced from existing dashboard reports, never mocked. */
  summaryLoading = true;
  summary = {
    clients: null as number,
    loans: null as number,
    collected: null as number,
    disbursed: null as number
  };

  /**
   * Gets user activities from local storage and uses the existing dashboard report service.
   */
  constructor(private router: Router,
              private homeService: HomeService) {
    const storedActivity = localStorage.getItem('mifosXLocation');
    this.userActivity = storedActivity ? JSON.parse(storedActivity) || [] : [];
  }

  ngOnInit() {
    this.recentActivities = this.getRecentActivities();
    this.frequentActivities = this.getFrequentActivities();
    this.loadSummary();
  }

  /**
   * Loads the four dashboard summary cards from the same report endpoints already used by the charts.
   * Failures are isolated so an unavailable report does not block the dashboard.
   */
  loadSummary() {
    const officeId = 1;
    forkJoin([
      this.homeService.getTotalClients().pipe(catchError(() => of(null))),
      this.homeService.getLoanTrendsByDay(officeId).pipe(catchError(() => of(null))),
      this.homeService.getCollectedAmount(officeId).pipe(catchError(() => of(null))),
      this.homeService.getDisbursedAmount(officeId).pipe(catchError(() => of(null)))
    ]).subscribe((responses: any[]) => {
      this.summary.clients = this.totalElements(responses[0]);
      this.summary.loans = this.sumField(responses[1], 'lcount');
      this.summary.collected = this.secondNumericValue(responses[2]);
      this.summary.disbursed = this.secondNumericValue(responses[3]);
      this.summaryLoading = false;
    }, () => {
      this.summaryLoading = false;
    });
  }

  /** Read the paged client search total used by the Clients screen. */
  private totalElements(response: any): number {
    if (!response) {
      return null;
    }
    const value = Number(response.totalElements);
    return Number.isFinite(value) ? value : null;
  }

  /** Sum a numeric field from a report response. */
  private sumField(response: any, field: string): number {
    if (!Array.isArray(response)) {
      return null;
    }
    return response.reduce((total: number, entry: any) => {
      const value = Number(entry && entry[field]);
      return total + (Number.isFinite(value) ? value : 0);
    }, 0);
  }

  /**
   * Existing collection/disbursement report components treat the second value as Collected/Disbursed.
   * Mirror that contract for the dashboard summary card.
   */
  private secondNumericValue(response: any): number {
    if (!Array.isArray(response) || !response.length || !response[0]) {
      return null;
    }
    const values = Object.keys(response[0]).map((key: string) => Number(response[0][key]));
    const value = values.length > 1 ? values[1] : values[0];
    return Number.isFinite(value) ? value : null;
  }

  /**
   * Returns top eight recent activities.
   */
  getRecentActivities() {
    const reverseActivities = [...(this.userActivity || [])].reverse();
    const uniqueActivities: string[] = [];
    reverseActivities.forEach((activity: string) => {
      if (!uniqueActivities.includes(activity)) {
        uniqueActivities.push(activity);
      }
    });
    const topEightRecentActivities =
      uniqueActivities
        .filter((activity: string) => !['/', '/login', '/home', '/dashboard'].includes(activity))
        .slice(0, 8);
    return topEightRecentActivities;
  }

  /**
   * Returns top eight frequent activities.
   */
  getFrequentActivities() {
    const frequencyCounts: any  = {};
    let index  = (this.userActivity || []).length;
    while (index) {
      frequencyCounts[this.userActivity[--index]] = (frequencyCounts[this.userActivity[index]] || 0) + 1;
    }
    const frequencyCountsArray = Object.entries(frequencyCounts);
    const topEigthFrequentActivities =
      frequencyCountsArray
        .sort((a: any, b: any) => b[1] - a[1])
        .map((entry: any[]) => entry[0])
        .filter((activity: string) => !['/', '/login', '/home', '/dashboard'].includes(activity))
        .slice(0, 8);
    return topEigthFrequentActivities;
  }

  /**
   * Navigates to the activity
   */
  navigatetoActivity(activity: string) {
    this.router.navigateByUrl(activity);
  }

}
