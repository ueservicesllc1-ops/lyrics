import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <div className="flex items-center">
      {/* 
        ¡LISTO!
        Solo tienes que guardar tu archivo "logo.png" en la carpeta `public` 
        que está en la raíz de tu proyecto. El código ya está preparado.
      */}
      <Image
        src="/logo.png" // <-- ¡Ya está apuntando a tu logo local!
        alt="My SetList Logo"
        width={150}
        height={40}
        priority // Carga el logo más rápido
      />
    </div>
  );
};

export default Logo;
