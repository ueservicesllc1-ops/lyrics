import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <div className="flex items-center">
       {/* 
        PASO FINAL PARA TI:
        1. Guarda tu archivo "logo.png" en la carpeta `public` que está en la raíz de tu proyecto.
        2. Reemplaza el `src` de abajo con la ruta a tu logo, por ejemplo: `src="/logo.png"`.
      */}
      <Image
        src="https://placehold.co/150x40/1e1b4b/ffffff?text=My+SetList" // <-- REEMPLAZA ESTA URL
        alt="My SetList Logo"
        width={150}
        height={40}
        priority // Carga el logo más rápido
      />
    </div>
  );
};

export default Logo;
