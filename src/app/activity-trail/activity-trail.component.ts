import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivityTrailService } from './activity-trail.service';

@Component({
  selector: 'mifosx-bancro-activity-trail',
  templateUrl: './activity-trail.component.html',
  styleUrls: ['./activity-trail.component.scss']
})
export class ActivityTrailComponent implements OnInit {
  summary: any = {};
  activities: any[] = [];
  selected: any;
  loading = false;
  error = '';
  filterForm: FormGroup;

  constructor(private fb: FormBuilder, private service: ActivityTrailService) {
    this.filterForm = this.fb.group({
      category: [''],
      action: [''],
      status: [''],
      transactionReference: [''],
      entityType: [''],
      entityId: [''],
      username: [''],
      mine: [false],
      limit: [150]
    });
  }

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.service.summary().subscribe({ next: x => this.summary = x || {}, error: () => this.summary = {} });
    this.service.search(this.filterForm.value).subscribe({
      next: x => {
        this.activities = x || [];
        if (this.selected && !this.activities.some(a => a.id === this.selected.id)) { this.selected = undefined; }
        this.loading = false;
      },
      error: e => { this.loading = false; this.error = this.errorText(e, 'Unable to load Bancro activity trail.'); }
    });
  }

  reset(): void {
    this.filterForm.reset({ category: '', action: '', status: '', transactionReference: '', entityType: '', entityId: '', username: '', mine: false, limit: 150 });
    this.refresh();
  }

  open(row: any): void { this.selected = row; }

  details(row: any): any {
    if (!row?.details_json) { return null; }
    try { return JSON.parse(row.details_json); } catch (_) { return row.details_json; }
  }

  private errorText(e: any, fallback: string): string {
    return e?.error?.defaultUserMessage || e?.error?.developerMessage || e?.error?.errors?.[0]?.defaultUserMessage || e?.message || fallback;
  }
}
