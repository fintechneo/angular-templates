/**
 * Demo of using the ReactiveFormsAssistant
 */
import {Component, DoCheck, OnInit,
    ViewChild, Renderer2, ElementRef} from '@angular/core';

import { MatDrawer } from '@angular/material';

import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ReactiveFormAssistant } from './reactiveformsassistant';

export class Meeting {
    title = 'Meeting';
    dateAndTime: number = null;
    locationName: string = null;
    latitude: number = null;
    longitude: number = null;
    agendaItems: Array<AgendaItem> = [];
}

export class AgendaItem {
    public title: string = null;
    public description: string = null;
    public agendaItemType: string = null;

    public static fromTitle(title: string): AgendaItem {
        const agendaItem = new AgendaItem();
        agendaItem.title = title;
        return agendaItem;
    }
}

@Component({
    templateUrl: 'reactiveformsdemo.component.html',
    providers: [ReactiveFormAssistant]
})
export class ReactiveFormsDemoComponent implements DoCheck, OnInit {
    sidenavmode: string;
    sidenavopened = false;
    dropzonevisible = false;
    editing = false;

    agendaSuggestions: AgendaItem[] = [
        AgendaItem.fromTitle('Coffee break'),
        AgendaItem.fromTitle('Market update'),
        AgendaItem.fromTitle('New board member')
    ];

    @ViewChild('sidenav') sidenav: MatDrawer;
    @ViewChild('dragCanvas') dragCanvas: ElementRef;

    draggedAgendaItem: AgendaItem;

    dragEndListener: EventListener;

    formGroup: FormGroup;

    constructor(
        private renderer: Renderer2,
        private formBuilder: FormBuilder,
        private reactiveFormAssistant: ReactiveFormAssistant
    ) {
        this.formGroup = formBuilder.group(
            Object.assign(new Meeting(),
                {
                    agendaItemsArrayTemplate: formBuilder.group(new AgendaItem()),
                    agendaItems: formBuilder.array([])
                }
            )
        );

        // Connect Reactive Forms Assistance to formgroup
        this.reactiveFormAssistant.formGroup = this.formGroup;
        this.reactiveFormAssistant.controlsubscribe(); // subscribe to the controls

        // Create a websocket connection (to http://localhost:4200 if testing locally)
        const ws = new WebSocket(`ws${location.origin.substr(4)}/websocketrelay`);

        const myMessages = {}; // Track messages sent by me

        // Subscribe to changes made by the user in the form and send to the websocket server
        this.reactiveFormAssistant.formUpdatesSubject.subscribe(formUpdateEvent => {
            const message = JSON.stringify(formUpdateEvent);
            myMessages[message] = true;
            ws.send(message);
        });

        // Subscribe to messages from the websocket server and patch form with updates
        ws.onmessage = messageEvent => {
            if (myMessages[messageEvent.data]) {
                // Don't patch form with our own messages
                delete myMessages[messageEvent.data];
            } else {
                this.reactiveFormAssistant.patchFormUpdateEvent(JSON.parse(messageEvent.data));
            }
        };
    }

    ngOnInit() {
        this.dragEndListener = this.renderer.listen('window', 'dragend', () => {
            this.dropzonevisible = false;
        });
    }

    public ngDoCheck() {
        if (window.innerWidth > 768) {
            this.sidenavmode = 'side';
            this.sidenavopened = true;
        } else {
            this.sidenavmode = 'over';
        }
    }

    get agendaItems(): FormArray {
        return this.formGroup.get('agendaItems') as FormArray;
    }

    dragstart(event: DragEvent, agendaItem: AgendaItem) {
        event.dataTransfer.setData('text/plain', agendaItem.title);
        event.dataTransfer.effectAllowed = 'copy';

        const canv: HTMLCanvasElement = this.dragCanvas.nativeElement;

        const ctx: CanvasRenderingContext2D = canv.getContext('2d');
        ctx.font = '20px Roboto';
        canv.width = ctx.measureText(agendaItem.title).width;
        ctx.font = '20px Roboto';

        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.fillText(agendaItem.title, 0, 20);

        event.dataTransfer.setDragImage(canv, 0, 0);

        this.draggedAgendaItem = agendaItem;
        this.dropzonevisible = true;
    }

    drop(event: DragEvent) {
        event.preventDefault();

        this.reactiveFormAssistant.addRowToFormArray(
            this.formGroup.controls['agendaItems'] as FormArray,
            this.draggedAgendaItem,
            true
        );

        this.dropzonevisible = false;
    }

    deleteAgendaItem(index: number) {
        this.reactiveFormAssistant.removeRowFromFormArray(
            this.formGroup.controls['agendaItems'] as FormArray,
            index,
            true
        );
    }

    moveAgendaItemUp(index: number) {
        const formArray = (this.formGroup.controls['agendaItems'] as FormArray);
        const current = formArray.at(index);
        const replaceWith = formArray.at(index - 1);
        formArray.setControl(index - 1, current);
        formArray.setControl(index,replaceWith);
        this.reactiveFormAssistant.sendFullArray(formArray);
    }

    moveAgendaItemDown(index: number) {
        const formArray = (this.formGroup.controls['agendaItems'] as FormArray);
        const current = formArray.at(index);
        const replaceWith = formArray.at(index + 1);
        formArray.setControl(index + 1, current);
        formArray.setControl(index, replaceWith);
        this.reactiveFormAssistant.sendFullArray(formArray);
    }
}
