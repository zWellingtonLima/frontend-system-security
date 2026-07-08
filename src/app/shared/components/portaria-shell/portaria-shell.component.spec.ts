import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortariaShellComponent } from './portaria-shell.component';

describe('PortariaShellComponent', () => {
  let component: PortariaShellComponent;
  let fixture: ComponentFixture<PortariaShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortariaShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortariaShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
