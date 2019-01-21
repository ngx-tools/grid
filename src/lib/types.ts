import 'reflect-metadata';

export const gridMetadataKey = 'Grid';

export type GridActions = ({
    title?: string; // will be translated
    class?: string; // fontAwesome class name
    routerLink?: Function;
    click?: Function;
    doAction?: string;
} | {
    type: 'update' | 'destroy';
})[];

export interface GridOption {
    render?: Function;
    actions?: GridActions;
    dataType?: 'date-time' | 'string' | 'number' | 'image' | 'file';
    format?: string;
    order?: number;
}

export function Grid(option?: GridOption) {
    return Reflect.metadata(gridMetadataKey, option || {});
}

export function getGrid(target: any, propertyKey: string) {
    return Reflect.getMetadata(gridMetadataKey, target, propertyKey);
}

export class Pagination<T> {
    static DEFAULT_PER_PAGE = 10;
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
}
