import { Component, OnInit } from '@angular/core';
import { ReconciliationService } from './reconciliation.service';

@Component({
  selector: 'mifosx-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit {
  summary: any;
  batches: any[] = [];
  exceptions: any[] = [];
  selectedBatch: any;
  fromDate = '';
  toDate = '';
  rail = 'NIP';
  simulatorScenario = 'NORMAL';
  loading = false;
  error = '';
  message = '';

  batchColumns = ['reference', 'date', 'rail', 'source', 'grossDebit', 'matched', 'exceptions', 'status', 'actions'];
  itemColumns = ['line', 'provider', 'bancro', 'amount', 'status', 'gl', 'resolution'];
  exceptionColumns = ['batch', 'provider', 'reference', 'amount', 'exception', 'resolution', 'actions'];

  constructor(private service: ReconciliationService) {
    const today = new Date();
    this.toDate = this.isoDate(today);
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    this.fromDate = this.isoDate(from);
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.service.summary(this.fromDate, this.toDate, this.rail).subscribe({
      next: x => { this.summary = x; this.loading = false; },
      error: e => { this.error = this.errorText(e, 'Unable to load reconciliation summary'); this.loading = false; }
    });
    this.service.batches('', this.rail).subscribe({
      next: x => this.batches = x || [],
      error: e => this.error = this.errorText(e, 'Unable to load settlement batches')
    });
    this.loadExceptions();
  }

  loadExceptions(): void {
    this.service.exceptions('', 'OPEN').subscribe({
      next: x => this.exceptions = x || [],
      error: e => this.error = this.errorText(e, 'Unable to load reconciliation exceptions')
    });
  }

  selectBatch(batch: any): void {
    this.service.batch(batch.id).subscribe({
      next: x => this.selectedBatch = x,
      error: e => this.error = this.errorText(e, 'Unable to load settlement batch')
    });
  }

  generateSimulatorBatch(): void {
    this.message = '';
    this.error = '';
    if (this.rail !== 'NIP' && this.rail !== 'NPS') { this.error = 'Simulator settlement generation supports NIP or NPS only.'; return; }
    this.service.generateSimulatorBatch(this.toDate, this.simulatorScenario, this.rail).subscribe({
      next: x => {
        this.message = `Settlement batch ${x.batchReference} generated from successful unsettled ${this.rail} transactions.`;
        this.selectedBatch = x;
        this.refresh();
      },
      error: e => this.error = this.errorText(e, 'Unable to generate simulator settlement batch')
    });
  }

  reconcile(batch: any): void {
    this.message = '';
    this.error = '';
    this.service.reconcile(batch.id).subscribe({
      next: x => {
        this.selectedBatch = x;
        this.message = `${x.batchReference} reconciled: ${x.matchedCount} matched, ${x.exceptionCount} exception(s).`;
        this.refresh();
      },
      error: e => this.error = this.errorText(e, 'Reconciliation failed')
    });
  }

  resolveException(item: any): void {
    const note = window.prompt('Resolution note (required). This acknowledges the exception only; it does not alter balances or GL entries.');
    if (!note) { return; }
    this.service.resolveException(item.id, 'RESOLVE', note).subscribe({
      next: () => { this.message = 'Exception acknowledged and retained in the audit trail.'; this.loadExceptions(); if (this.selectedBatch) { this.selectBatch(this.selectedBatch); } },
      error: e => this.error = this.errorText(e, 'Unable to resolve exception')
    });
  }

  reopen(item: any): void {
    this.service.resolveException(item.id, 'REOPEN', 'Exception reopened for further investigation').subscribe({
      next: () => { this.message = 'Exception reopened.'; this.loadExceptions(); if (this.selectedBatch) { this.selectBatch(this.selectedBatch); } },
      error: e => this.error = this.errorText(e, 'Unable to reopen exception')
    });
  }

  private isoDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const dd = `${date.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private errorText(e: any, fallback: string): string {
    return e?.error?.defaultUserMessage || e?.error?.developerMessage || e?.error?.errors?.[0]?.defaultUserMessage || e?.message || fallback;
  }
}
