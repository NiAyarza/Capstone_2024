import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'especialidad'
})
export class EspecialidadPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.replace(/-/g, ' '); // Reemplaza los guiones por espacios
  }
}
