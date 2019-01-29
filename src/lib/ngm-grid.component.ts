import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit, Optional,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractEntity, NgmBaseService, Helper} from 'ngm-base';
import {getGrid, GridActions, GridOption, Pagination} from './types';
import 'reflect-metadata';

@Component({
    selector: 'ngm-grid',
    template: `
        <div [dir]="baseService.dir" [class]="baseService.dir === 'rtl' ? 'rtl-support' : ''">
            <table datatable [dtOptions]="dtOptions" [dtTrigger]="dtTrigger" class="row-border hover" width="100%">
                <thead *ngIf="entities?.length > 0">
                <tr>
                    <ng-container *ngFor="let key of this.entityKeys">
                        <td *ngIf="key !== 'actions'" [translate]="this.translatePrefix + key"></td>
                    </ng-container>
                    <td *ngIf="this.entityGridOptions.has('actions') && entities[0].actions" [translate]="'grid.actions'"></td>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let entity of this.entities">
                    <ng-container *ngFor="let key of this.entityKeys">
                        <td *ngIf="key !== 'actions'" [innerHtml]="render(entity, key)"></td>
                    </ng-container>
                    <td *ngIf="this.entityGridOptions.has('actions') && entity.actions">
                        <ng-container *ngFor="let action of this.entityGridOptions.get('actions').actions">
                            <ng-container *ngIf="action['type']; then defaultActions else customActions"></ng-container>
                            <ng-template #defaultActions>
                            <span [ngSwitch]="action['type']">
                                <fa-icon *ngSwitchCase="'update'"
                                         style="cursor: pointer; color: darkorange"
                                         [class]="'grid-btn'" [icon]="['fas', 'edit']" size="lg"
                                         (click)="doAction('update', entity)" [title]="'button.update' | translate"></fa-icon>
                                <fa-icon *ngSwitchCase="'destroy'"
                                         style="cursor: pointer; color: darkred"
                                         [class]="'grid-btn'" [icon]="['fas', 'trash-alt']" size="lg"
                                         (click)="doAction('destroy', entity)" [title]="'button.destroy' | translate"></fa-icon>
                            </span>
                            </ng-template>
                            <ng-template #customActions>
                                <fa-icon style="cursor: pointer"
                                         [class]="'grid-btn'" [icon]="['fas', action['class']]" size="lg"
                                         (click)="action['routerLink'] ? routerFunc(entity, action.routerLink(entity))
                               : (action['click'] ? action.click(entity)
                               : (action['doAction'] ? doAction(action.doAction, entity) : null))"
                                         [title]="action['title'] | translate"></fa-icon>
                            </ng-template>
                        </ng-container>
                    </td>
                </tr>
                <tr *ngIf="this.entities?.length == 0">
                    <td [attr.colspan]="this.entityKeys.length + 1" class="no-data-available" [translate]="'grid.no_data'"></td>
                </tr>
                </tbody>
            </table>
        </div>
    `,
    styles: [`
        .rtl-support table.dataTable.dtr-inline.collapsed > tbody > tr[role="row"] > td:first-child:before,
        .rtl-support table.dataTable.dtr-inline.collapsed > tbody > tr[role="row"] > th:first-child:before {
            right: 0;
        }

        .rtl-support table.dataTable.dtr-inline.collapsed > tbody > tr[role="row"] > td:first-child,
        .rtl-support table.dataTable.dtr-inline.collapsed > tbody > tr[role="row"] > th:first-child {
            position: relative;
            padding-right: 30px;
            cursor: pointer;
        }
    `],
    encapsulation: ViewEncapsulation.None
})

export class NgmGridComponent<Entity extends AbstractEntity> implements OnInit, OnChanges, OnDestroy {
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;

    @Input()
    entities: AbstractEntity[];
    @Input()
    dtOptions: DataTables.Settings = {};
    @Input()
    dtTrigger: Subject<any> = new Subject();

    @Input()
    hiddenFields: string[] = [];

    @Input()
    addFields: Map<string, GridOption> = new Map<string, GridOption>();

    @Input()
    customActions: GridActions = undefined;

    @Output()
    action: EventEmitter<any> = new EventEmitter<any>();

    entityKeys = [];

    translatePrefix = '';

    entityGridOptions: Map<string, GridOption> = new Map<string, GridOption>();

    dtLangFile = {
        fa: 'Persian',
        en: 'English'
    };

    constructor(public translate: TranslateService, @Optional() private router: Router, @Optional() private route: ActivatedRoute,
                public baseService: NgmBaseService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entities']) {
            if (this.entities.length > 0) {
                const me = this;
                this.translatePrefix = 'entity.' + this.entities[0]._name + '.';
                this.entityKeys = [];
                this.entityGridOptions.clear();
                Object.keys(this.entities[0]).forEach(function (value) {
                    if (me.hiddenFields.includes(value)) {
                        return;
                    }
                    const option: GridOption = getGrid(me.entities[0], value);
                    if (option) {
                        if (option.order === undefined) {
                            option.order = me.entityGridOptions.size + 1;
                        }
                        me.entityGridOptions.set(value, option);
                    }
                });
                if (me.customActions) {
                    if (me.customActions.length > 0) {
                        me.entityGridOptions.set('actions', {actions: me.customActions});
                    } else {
                        me.entityGridOptions.delete('actions');
                    }
                }
                if (this.addFields) {
                    this.addFields.forEach(function (option, value) {
                        if (option.order === undefined) {
                            option.order = me.entityGridOptions.size + 1;
                        }
                        me.entityGridOptions.set(value, option);
                    });
                }
                this.entityGridOptions = new Map([...Array.from(this.entityGridOptions.entries())]
                    .sort((a: [string, GridOption], b: [string, GridOption]) => {
                        return a[1].order - b[1].order;
                    }));
                this.entityGridOptions.forEach((value, key) => {
                    me.entityKeys.push(key);
                });
                this.dtRender();
            }
        }
    }

    ngOnInit(): void {
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: Pagination.DEFAULT_PER_PAGE,
            retrieve: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.16/i18n/' + this.dtLangFile[this.translate.currentLang] + '.json'
            },
            responsive: true,
            order: []
        };
    }

    doAction(name, entity) {
        this.action.emit({name: name, value: entity});
    }

    dtRender(): void {
        this.dtTrigger.next();
    }

    render(entity, key) {
        if (this.entityGridOptions.has(key) && this.entityGridOptions.get(key).dataType) {
            switch (this.entityGridOptions.get(key).dataType) {
                case 'date-time':
                    if (!entity[key]) {
                        return;
                    }
                    const format = this.entityGridOptions.get(key).format || 'YYYY/MM/DD HH:mm:ss';
                    return `
<span dir="ltr"> ${this.translate.currentLang === 'fa' ? Helper.toJalali(entity[key], format) : entity[key]}</span>`;
                case 'image':
                    if (!entity[key]) {
                        return;
                    }
                    return `<img width="150px" src="${entity[key].url}" alt="${entity[key].title}">`;
                case 'file':
                    if (!entity[key]) {
                        return;
                    }
                    return `<a target="_blank" href="${entity[key].url}">${entity[key].title}</a>`;
            }
        }
        if (this.entityGridOptions.has(key) && this.entityGridOptions.get(key).render) {
            return this.entityGridOptions.get(key).render(entity[key], entity);
        } else {
            return entity[key];
        }
    }

    routerFunc(entity, route) {
        if (this.route && this.router) {
            this.router.navigate(route.split('/'), {relativeTo: this.route});
        }
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }
}
