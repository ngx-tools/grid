import {NgModule} from '@angular/core';
import {NgmGridComponent} from './ngm-grid.component';
import {DataTablesModule} from 'angular-datatables';
import {CommonModule} from '@angular/common';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgmBaseModule} from 'ngm-base';

library.add(fas, far);

@NgModule({
    declarations: [NgmGridComponent],
    imports: [
        CommonModule,
        NgmBaseModule,
        DataTablesModule,
        FontAwesomeModule,
    ],
    exports: [NgmGridComponent]
})
export class NgmGridModule {
}
