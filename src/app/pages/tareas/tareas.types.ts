export interface ICriterioAceptacion {
  descripcion: string;
  cumplido: boolean;
}

export interface ITarea {
  _id?: string;
  titulo: string;
  descripcion: string;
  proyecto: string;
  ingenieroAsignado: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'En progreso' | 'Finalizada';

  criteriosAceptacion?: ICriterioAceptacion[];

  createdAt?: Date;
  updatedAt?: Date;
}