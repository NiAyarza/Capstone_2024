import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-disponibilidad-filtro-modal',
  templateUrl: './disponibilidad-filtro-modal.component.html',
  styleUrls: ['./disponibilidad-filtro-modal.component.scss'],
})
export class DisponibilidadFiltroModalComponent {
  @Input() filtroFecha: string = ''; // Recibe el valor inicial de la fecha desde el componente padre

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss(); // Cierra el modal sin enviar datos
  }

  aplicarFiltro() {
    this.modalCtrl.dismiss({ filtroFecha: this.filtroFecha }); // Envía la fecha seleccionada al componente padre
  }
}
