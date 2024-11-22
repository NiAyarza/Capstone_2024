import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfesionalService } from '../services/profesional.service'; // Asegúrate de que tienes el servicio

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  profesional: any;
  usuarioId: string = '';
  id: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private profesionalService: ProfesionalService
  ) {}

  ngOnInit() {
    // Obtener el id del parámetro de la URL
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id');  // Obtener el 'id' del parámetro
      console.log('ID del profesional:', this.id);  // Verifica que se obtenga correctamente
    });
    this.usuarioId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.obtenerPerfil();
  }

  obtenerPerfil() {
    this.profesionalService.obtenerPerfil(this.usuarioId).then((perfil) => {
      this.profesional = perfil;
    });
  }
}
