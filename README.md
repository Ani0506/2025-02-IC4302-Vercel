# Vercel UI

Este proyecto en Next.js 16 utiliza Firebase Authentication + Firestore (para metadatos de usuario) junto con MongoDB Atlas (para los datos de productos y favoritos). Las rutas de API bajo `app/api` exponen el catálogo y los endpoints de favoritos respaldados por MongoDB, mientras que las cookies de sesión de Firebase protegen las páginas que requieren autenticación.

## Cómo empezar

1. Instala las dependencias (después de actualizar `pnpm-lock.yaml`):  
   `pnpm install`
2. Crea un archivo `.env.local` con las variables listadas abajo.
3. Ejecuta el servidor de desarrollo con `pnpm dev`.

## Variables de entorno requeridas

| Alcance            | Variable                                   | Descripción                                                                |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------- |
| Cliente y servidor | `NEXT_PUBLIC_FIREBASE_API_KEY`             | Clave de API web de Firebase                                               |
|                    | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Dominio de autenticación de Firebase                                       |
|                    | `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | ID de proyecto de Firebase                                                 |
|                    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Bucket de almacenamiento de Firebase                                       |
|                    | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID de emisor de mensajería de Firebase                                     |
|                    | `NEXT_PUBLIC_FIREBASE_APP_ID`              | ID de aplicación de Firebase                                               |
| (opcional)         | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | ID de medición para Analytics                                              |
| Servidor           | `FIREBASE_PROJECT_ID`                      | ID de proyecto de la cuenta de servicio                                    |
|                    | `FIREBASE_CLIENT_EMAIL`                    | Correo de cliente de la cuenta de servicio                                 |
|                    | `FIREBASE_PRIVATE_KEY`                     | Llave privada de la cuenta de servicio (escapar saltos de línea como `\n`) |
|                    | `MONGODB_URI`                              | Cadena de conexión a MongoDB Atlas                                         |
| (opcional)         | `MONGODB_DB_NAME`                          | Nombre de la base de datos (por defecto `ic4302`)                          |
| (opcional)         | `MONGODB_PRODUCTS_COLLECTION`              | Colección para documentos de catálogo (por defecto `documents`)            |
| (opcional)         | `MONGODB_FAVORITES_COLLECTION`             | Colección para favoritos (por defecto `favorites`)                         |

## Fuentes de datos

- `lib/firebase/*` inicializa el uso del SDK de Firebase tanto en cliente como en servidor.
- `lib/mongo/*` gestiona las conexiones a MongoDB Atlas y expone accesos tipados a las colecciones.
- `lib/server/products.ts` centraliza las operaciones de productos y favoritos sobre MongoDB.

## Resumen de la API

- `GET /api/products`: lista productos con filtros opcionales (búsqueda, facetas, ordenamiento).
- `GET /api/products/:id`: obtiene un documento de producto específico.
- `GET /api/products/facets`: devuelve las facetas de catálogo (editorial, idioma, edición, año).
- `GET /api/favorites`: lista los IDs de productos favoritos del usuario autenticado.
- `POST /api/favorites`: agrega un producto a favoritos.
- `DELETE /api/favorites?productId=...`: elimina un producto de favoritos.
- `POST /api/session`: crea una cookie de sesión respaldada por Firebase a partir de un ID token.
- `DELETE /api/session`: elimina la cookie de sesión y cierra la sesión.

## Componentes

### Backend API

El backend del componente MercadoTech está implementado usando **Next.js API Routes** sobre Node.js. Centraliza la lógica de productos y favoritos en `lib/server/products.ts`, mientras que `lib/firebase/admin.ts` y `lib/server/auth.ts` se encargan de la verificación de sesión y de usuario.

Tecnologías y responsabilidades principales:

- **Next.js API Routes** bajo `app/api` para exponer endpoints REST.
- **MongoDB Atlas**:
  - Colección de productos (por defecto `documents`).
  - Colección de favoritos (por defecto `favorites`).
  - **Atlas Search** opcional para búsqueda de texto y facetas.
- **Firebase Admin SDK**:
  - Verifica la cookie `session`.
  - Obtiene la información básica del usuario autenticado.
- **Lógica de dominio** (en `lib/server/products.ts`):
  - Normaliza documentos de MongoDB a un modelo de `Product` amigable para la UI (precio, calificación, número de reseñas, categoría, editorial, fecha de publicación, entidades, etc.).
  - Construye consultas que combinan búsqueda por texto y filtros por facetas.
  - Gestiona los favoritos del usuario (agregar, eliminar, listar).

#### Endpoints principales

- `GET /api/products`  
  Devuelve una lista filtrada de productos.

  Parámetros de consulta:

  - `search`: texto libre aplicado sobre campos como título, descripción, entidades y editorial.
  - `publisher`: uno o varios valores de editorial (`?publisher=A&publisher=B`).
  - `language`: uno o varios valores de idioma.
  - `edition`: una o varias ediciones.
  - `pubYear`: uno o varios años de publicación.

  Comportamiento:

  - Construye filtros de facetas a partir de la cadena de consulta.
  - Usa Atlas Search cuando está disponible; en caso contrario, recurre a consultas regulares sobre MongoDB.
  - Normaliza cada documento al modelo `Product` consumido por la UI.

- `GET /api/products/:id`  
  Devuelve la información detallada de un producto.

  Parámetro de ruta:

  - `:id`: identificador del producto. El backend intenta varias estrategias (`id` explícito, `_id` como ObjectId, `_id` como string, `ASIN`) para localizar el documento.

  Comportamiento:

  - Busca el producto usando los diferentes identificadores soportados.
  - Retorna `404` si no se encuentra ningún producto.

- `GET /api/products/facets`  
  Devuelve información de facetas (editorial, idioma, edición, año de publicación) para la barra lateral de filtros.

  Parámetros de consulta:

  - `search` (opcional): restringe el cálculo de facetas a documentos que coincidan con un texto dado.

  Comportamiento:

  - Usa `$searchMeta` con Atlas Search para calcular facetas.
  - Si Atlas Search no está disponible, utiliza pipelines de agregación de MongoDB (`$match`, `$group`, `$sort`, `$limit`).
  - Normaliza los buckets al formato `{ value, count }` para cada faceta.

- `GET /api/favorites`  
  Devuelve la lista de IDs de productos que el usuario autenticado ha marcado como favoritos.

  Comportamiento:

  - Valida la cookie `session` vía Firebase.
  - Si no hay sesión válida, responde con un arreglo vacío.
  - Si hay usuario autenticado, consulta la colección de favoritos por `userId` y devuelve los `productId` correspondientes.

- `POST /api/favorites`  
  Agrega un producto a los favoritos del usuario.

  Cuerpo de la petición (JSON):

  - `productId` (string, requerido): ID del producto a marcar como favorito.

  Comportamiento:

  - Requiere una cookie `session` válida; de lo contrario, devuelve `401`.
  - Hace un upsert de `{ userId, productId, createdAt }` en la colección de favoritos.

- `DELETE /api/favorites?productId=...`  
  Elimina un producto de los favoritos del usuario.

  Parámetros de consulta:

  - `productId` (string, requerido): ID del producto a eliminar de favoritos.

  Comportamiento:

  - Requiere una cookie `session` válida; de lo contrario, devuelve `401`.
  - Elimina el documento `{ userId, productId }` correspondiente de la colección de favoritos.

- `POST /api/session`  
  Crea una cookie de sesión de servidor a partir de un Firebase ID token.

  Cabeceras:

  - `Authorization: Bearer <ID_TOKEN>`

  Comportamiento:

  - Verifica el ID token con Firebase Admin.
  - Crea una cookie `session` (HTTP-only, `sameSite=lax`, `secure` en producción) válida por 5 días.
  - Devuelve `{ success: true }` en caso de éxito o `401` si el token es inválido.

- `DELETE /api/session`  
  Elimina la cookie `session` y cierra la sesión del usuario.

### UI

La UI del componente MercadoTech está construida con **Next.js (App Router)** y componentes cliente de React. Proporciona la experiencia autenticada principal para buscar, filtrar y explorar productos, así como gestionar favoritos.

Elementos clave de la UI:

- **Páginas de autenticación** (`app/auth/*`):

  - `/auth/login`: inicio de sesión con correo y contraseña usando el SDK de Firebase en el cliente. Tras un login exitoso, intercambia el Firebase ID token por una cookie `session` mediante `POST /api/session` y redirige a `/`.
  - `/auth/sign-up`: flujo de registro que crea un usuario en Firebase y redirige a `/auth/success` en caso de éxito.
  - `/auth/success`: pantalla de confirmación con acceso directo para volver a la página de inicio de sesión.

- **Página principal protegida** (`app/page.tsx`):

  - Usa `requireUser()` en el servidor para exigir autenticación (redirigiendo a `/auth/login` cuando sea necesario).
  - Renderiza el componente `MainLayout` con el usuario autenticado.

- **Main layout** (`components/main-layout.tsx`):

  - Encabezado con la marca de la aplicación y el correo del usuario autenticado.
  - Botón de cierre de sesión que llama a `DELETE /api/session`, cierra la sesión de Firebase en el cliente y redirige a `/auth/login`.
  - Barra de búsqueda integrada para actualizar el estado `searchQuery`.
  - Barra lateral de filtros para ajustar las facetas seleccionadas.
  - Grilla de productos para mostrar los resultados.

- **Barra de filtros** (`components/filter-sidebar.tsx`):

  - Obtiene datos de facetas desde `GET /api/products/facets`, opcionalmente acotados por el texto de búsqueda actual.
  - Muestra buckets de facetas para editorial, idioma, edición y año de publicación.
  - Permite activar/desactivar valores de faceta, actualizando el estado de filtros seleccionados.

- **Grilla de productos** (`components/product-grid.tsx`):

  - Obtiene productos desde `GET /api/products` usando parámetros de `search` y facetas.
  - Muestra tarjetas con título, descripción, precio, calificación, número de reseñas y estado de inventario.
  - Enlaza cada tarjeta con la ruta de detalle correspondiente.

- **Vista de detalle de producto**:
  - Página de servidor: `app/product/[id]/page.tsx`:
    - Usa `requireUser()` y `fetchProductById()` para cargar el producto.
    - Usa `isProductFavorited()` para determinar el estado inicial de favorito para el usuario actual.
    - Renderiza `ProductDetailView` con el producto, el ID de usuario y el estado de favorito.
  - Componente cliente: `components/product-detail-view.tsx`:
    - Muestra la imagen principal (o un placeholder), categoría, título, editorial, fecha de publicación, entidades y la descripción completa.
    - Proporciona un botón para alternar el estado de favorito llamando a los endpoints `/api/favorites`.
    - Muestra opcionalmente un botón para abrir la URL de origen del producto en una nueva pestaña.
    - Incluye un enlace para volver a los resultados de búsqueda.

En conjunto, estas piezas de backend y UI conforman el componente MercadoTech: un catálogo de productos autenticado que aprovecha MongoDB Atlas (con Atlas Search) y Firebase Authentication, expuesto mediante rutas de API de Next.js y renderizado a través de una interfaz basada en React.
