/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { TheiaDiagramServer } from '../sprotty/theia-diagram-server'
import { RequestModelAction, CenterAction, InitializeCanvasBoundsAction, ServerStatusAction } from 'sprotty/lib'
import { Widget } from "@phosphor/widgets"
import { Message } from "@phosphor/messaging/lib"
import URI from "@theia/core/lib/common/uri"

export class DiagramWidget extends Widget {

    private svgId: string

    private statusIconDiv: HTMLDivElement;
    private statusMessageDiv: HTMLDivElement;

    constructor(public readonly id: string,
                public readonly svgContainerId: string,
                public readonly uri: URI,
                public readonly diagramType: string,
                public readonly diagramServer: TheiaDiagramServer) {
        super()
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg)
        const svgContainer = document.createElement("div")
        this.svgId = this.svgContainerId + "_" + this.diagramType
        svgContainer.id = this.svgContainerId
        this.node.appendChild(svgContainer)

        const statusDiv = document.createElement("div")
        statusDiv.setAttribute('class', 'sprotty-status')
        this.node.appendChild(statusDiv)

        this.statusIconDiv = document.createElement("div")
        this.statusIconDiv.setAttribute('class', 'fa')
        statusDiv.appendChild(this.statusIconDiv)

        this.statusMessageDiv = document.createElement("div")
        this.statusMessageDiv.setAttribute('class', 'sprotty-status-message')
        statusDiv.appendChild(this.statusMessageDiv)

        this.diagramServer.handle(new RequestModelAction({
            sourceUri: this.uri.toString(),
            diagramType: this.diagramType
        }))
    }

    protected onAfterShow(msg: Message): void {
        super.onAfterShow(msg)
    }

    protected getBoundsInPage(element: Element) {
        const bounds = element.getBoundingClientRect()
        return {
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
        }
    }

    protected onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg)
        const newBounds = this.getBoundsInPage(this.node as Element)
        this.diagramServer.actionDispatcher.dispatch(new InitializeCanvasBoundsAction(newBounds))
        this.diagramServer.actionDispatcher.dispatch(new CenterAction([], false))
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg)
        const svgElement = document.getElementById(this.svgId)
        if (svgElement !== null)
            svgElement.focus()
    }

    protected onCloseRequest(msg: Message): void {
        super.onCloseRequest(msg)
        this.dispose()
    }

    protected onAfterHide(msg: Message): void {
        super.onAfterHide(msg)
    }

    protected onAfterDetach(msg: Message): void {
        super.onAfterDetach(msg)
    }

    protected onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg)
    }

    setStatus(status: ServerStatusAction): void {
        this.statusMessageDiv.textContent = status.message
        this.removeClasses(this.statusMessageDiv, 1)
        this.statusMessageDiv.classList.add(status.severity.toLowerCase())
        this.removeClasses(this.statusIconDiv, 1)
        const classes = this.statusIconDiv.classList
        classes.add(status.severity.toLowerCase())
        switch (status.severity) {
            case 'ERROR': classes.add('fa-exclamation-circle')
                break
            case 'WARNING': classes.add('fa-warning')
                break
            case 'INFO': classes.add('fa-info-circle')
                break
        }
    }

    protected removeClasses(element: Element, keep: number) {
        const classes = element.classList
        while (classes.length > keep)
            classes.remove(classes.item(classes.length - 1))
    }
}