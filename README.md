# Fintech Neo Angular Templates

This project started off from the sources in https://github.com/fintechneo/angular2-templates but was set up using [Angular CLI](https://github.com/angular/angular-cli)

# Components

## Canvas Table

A table component for providing inifinite scrolling (no paging) and instant rearranging of data. It renders data to an HTML canvas. A fork of the canvas table is also being used in the [Runbox 7](https://github.com/runbox/runbox7) email app.

Regarding the background for using a canvas, some explanation is given in the answer in the [Runbox community forum](https://community.runbox.com/t/why-is-the-ui-drawn-in-a-canvas-rather-than-using-semantic-html-elements/959)

## Reactive Forms Assistant

[Angular Reactive Forms](https://angular.io/guide/reactive-forms) is a form-technology capable of handling large and complex forms, and especially when it comes to track changes in form data. With Reactive Forms you can subscribe to value changes from every form element, and use it to create change events for the exact part of the form that was changed. The reactive form assistant does this by subscribing to all controls in a reactive form and create form update events. It is also able to consume incoming form update events and patch the affected controls.

Read more about the [Reactive Forms Assistant](docs/reactiveformassistant/README.md).
