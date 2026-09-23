/** Angular Imports */
import { Component, OnInit, ChangeDetectorRef, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';

/** rxjs Imports */
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { ProgressBarService } from '../progress-bar/progress-bar.service';

/**
 * Shell component.
 *
 * The Dore class is applied only while the authenticated shell exists. This is
 * deliberate: the existing Bancro login/reset-password screens remain outside
 * the Dore scope and retain their current design.
 */
@Component({
  selector: 'mifosx-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));
  /** Sets the initial state of sidenav as collapsed. Not collapsed if false. */
  sidenavCollapsed = false;
  /** Progress bar mode. */
  progressBarMode: string;
  /** Subscription to progress bar. */
  progressBar$: Subscription;

  constructor(private breakpointObserver: BreakpointObserver,
              private progressBarService: ProgressBarService,
              private cdr: ChangeDetectorRef,
              private renderer: Renderer2,
              private overlayContainer: OverlayContainer,
              @Inject(DOCUMENT) private document: Document) { }

  /** Subscribes to progress bar and activates authenticated Dore styling. */
  ngOnInit() {
    this.renderer.addClass(this.document.body, 'bancro-dore-authenticated');
    this.overlayContainer.getContainerElement().classList.add('bancro-dore-authenticated');

    this.progressBar$ = this.progressBarService.updateProgressBar.subscribe((mode: string) => {
      this.progressBarMode = mode;
      this.cdr.detectChanges();
    });
  }

  /** Toggles the Dore sub-menu while retaining the main icon rail. */
  toggleCollapse($event: boolean) {
    this.sidenavCollapsed = $event;
    this.cdr.detectChanges();
  }

  /** Removes shell-only Dore scope so login remains unchanged after logout. */
  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'bancro-dore-authenticated');
    this.overlayContainer.getContainerElement().classList.remove('bancro-dore-authenticated');
    if (this.progressBar$) {
      this.progressBar$.unsubscribe();
    }
  }
}
