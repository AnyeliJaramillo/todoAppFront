export interface Proyecto {
  _id?: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'En espera' | 'Finalizado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  fechaEntrega: string;
  ingenieroAsignado?: any;
  createdAt?: string;
  updatedAt?: string;
}