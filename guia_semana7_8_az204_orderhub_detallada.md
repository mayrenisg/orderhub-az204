**Guía detallada paso a paso**

**Semanas 7 y 8 de AZ-204![](Aspose.Words.55799490-3a1b-42cb-b7b6-7514cbc16748.001.png)**

Proyecto OrderHub adaptado a React + NestJS

Material para estudiantes principiantes

**Semanas 7 y 8 - Cosmos DB, auditoría funcional, Application Insights y monitoreo de OrderHub**



|**Objetivo final**|Evolucionar OrderHub para que registre eventos de negocio en Azure Cosmos DB y permita observar el comportamiento real de la aplicación con Application Insights. La Semana 7 introduce persistencia NoSQL para auditoría e historial de órdenes; la Semana 8 enseña monitoreo, telemetría, trazabilidad y diagnóstico de fallos reales.|
| - | :- |

Cómo usar este material. Esta guía mantiene el mismo estilo pedagógico de las semanas anteriores. No se limita a indicar comandos. Explica por qué se incorpora cada pieza, cómo se conecta con OrderHub, qué debe observar el estudiante y cómo distinguir si un problema viene del frontend, del backend, de Cosmos DB, de Application Insights o del despliegue en Azure.

1. **Panorama general de las semanas 7 y 8**

Objetivo pedagógico. En las semanas anteriores, OrderHub pasó de ser una aplicación básica a un sistema con frontend React, API NestJS, persistencia local, autenticación, autorización y secretos protegidos con Azure Key Vault. En este punto, la aplicación ya no se limita a responder endpoints: empieza a comportarse como una solución cloud real.

La Semana 7 introduce Azure Cosmos DB para guardar eventos de negocio y auditoría de órdenes. No reemplazaremos toda la base relacional ni borraremos lo aprendido sobre PostgreSQL. En lugar de eso, usaremos Cosmos DB para un caso de uso donde NoSQL tiene mucho sentido: historial flexible, eventos y actividad de una orden.

La Semana 8 introduce Application Insights para que los estudiantes aprendan a observar la aplicación. En una app real no basta con que el código funcione en la máquina del estudiante. Debemos poder saber qué ocurrió, cuánto tardó una petición, qué error se produjo, qué endpoint falló y cómo rastrear una operación completa.

Preguntas que el estudiante debe responder al terminar ambas semanas:

- ¿Por qué Cosmos DB puede ser útil para guardar eventos o historial flexible de órdenes?
- ¿Qué es una base de datos NoSQL y en qué se diferencia de una base relacional?
- ¿Qué es una partition key y por qué no se debe elegir al azar?
- ¿Cómo registra NestJS un evento de negocio cuando se crea una orden o se sube un archivo?
- ¿Qué es Application Insights y por qué una aplicación cloud necesita telemetría?
- ¿Cómo puedo diagnosticar errores 401, 403, 500, fallos de conexión o problemas de rendimiento?
2. **Qué debe quedar listo al finalizar**
- Existe una cuenta de Azure Cosmos DB creada para el laboratorio.
- Existe una base de datos y un contenedor para eventos de OrderHub.
- El backend NestJS puede guardar eventos de auditoría en Cosmos DB.
- La creación de una orden registra un evento ORDER\_CREATED.
- La subida de un archivo registra un evento FILE\_UPLOADED o equivalente.
- El frontend React puede consultar y mostrar el historial de una orden.
- Application Insights está conectado con el backend de OrderHub.
- Los logs, requests y errores de la API pueden verse desde Azure Portal.
- El estudiante puede provocar un error controlado y verlo reflejado en Application Insights.
- El estudiante puede explicar el recorrido completo: acción del usuario -> API -> Cosmos DB -> telemetría.

Estas semanas no agregan servicios por moda. Cada servicio responde a una necesidad real del producto. Cosmos DB ayuda a conservar eventos flexibles y Application Insights ayuda a entender qué ocurre cuando la aplicación ya está desplegada.

3. **Conceptos clave antes de comenzar**

Cosmos DB. Es una base de datos distribuida y administrada por Azure. En este laboratorio la usaremos como base NoSQL para guardar documentos JSON relacionados con eventos de OrderHub.

Base NoSQL. A diferencia de una base relacional tradicional, no obliga a modelar todo en tablas rígidas. Permite guardar documentos con estructuras flexibles. Esto resulta útil para auditoría, historial, logs de negocio y eventos que pueden cambiar con el tiempo.

Documento. Es el registro individual que guardaremos en Cosmos DB. Para OrderHub, un documento puede representar algo que ocurrió, por ejemplo: una orden fue creada, un archivo fue subido o un usuario intentó acceder a una ruta protegida.

Contenedor. En Cosmos DB, un contenedor agrupa documentos. Para esta práctica podemos crear un contenedor llamado order-events.

Partition key. Es el campo que Cosmos DB usa para distribuir datos. En esta guía usaremos /orderId porque queremos consultar eventos por orden.

Application Insights. Es el servicio de Azure que permite recolectar telemetría: requests, excepciones, métricas, trazas y dependencias. Nos ayuda a diagnosticar problemas sin depender únicamente de console.log.

Trazabilidad. Es la capacidad de seguir una operación desde que entra al sistema hasta que termina. En OrderHub, esto significa poder entender qué pasó cuando un usuario creó una orden o subió un archivo.

4. **Arquitectura integrada de Semana 7 y Semana 8**

La arquitectura de OrderHub ahora se amplía sin perder lo que ya fue construido. React continúa siendo la interfaz, NestJS continúa siendo la API principal, Blob Storage conserva archivos, Key Vault protege secretos, Cosmos DB guarda eventos de negocio y Application Insights observa el sistema completo.



|**Componente**|**Servicio/Ubicación**|**Función en estas semanas**|
| - | - | - |
|React SPA|Azure Static Web Apps / local|Muestra órdenes, login, adjuntos y ahora historial de eventos.|
|NestJS API|Azure App Service / local|Recibe solicitudes, aplica seguridad, guarda órdenes y registra eventos.|
|Azure Cosmos DB|Azure|Guarda eventos flexibles como ORDER\_CREATED y FILE\_UPLOADED.|
|Application Insights|Azure|Recolecta telemetría, errores, requests y trazas.|
|Key Vault|Azure|Guarda secretos de conexión usados por el backend.|
|Blob Storage|Azure|Conserva archivos adjuntos de órdenes.|

Flujo esperado: el usuario inicia sesión, consulta órdenes, crea una nueva orden o sube un archivo. NestJS ejecuta la operación principal, registra un evento en Cosmos DB y envía trazas a Application Insights. Luego React puede mostrar el historial de la orden.

**Semana 7 - Azure Cosmos DB aplicado a OrderHub**

5. **Por qué Cosmos DB ahora**

En la Semana 4 usamos PostgreSQL local para enseñar persistencia estructurada de órdenes. Eso sigue siendo válido. Pero no todos los datos de una aplicación se modelan igual. El historial de acciones de una orden puede crecer, cambiar y tener estructuras distintas según el evento.

Por ejemplo, un evento ORDER\_CREATED puede guardar total, cliente y usuario que creó la orden. Un evento FILE\_UPLOADED puede guardar nombre del archivo, tipo MIME, blobName y usuario que lo subió. Ambos son eventos de OrderHub, pero no tienen exactamente las mismas propiedades. Este tipo de información encaja muy bien en una base documental como Cosmos DB.

Caso funcional de la semana 7: cada vez que ocurra una acción importante en OrderHub, el backend registrará un evento de auditoría. El frontend podrá consultar el historial de eventos de una orden y mostrarlo como parte del detalle funcional del producto.

6. **Crear Cosmos DB en Azure**

**Paso 1. Crear una cuenta de Cosmos DB**

Qué vamos a hacer. Vamos a crear una cuenta de Cosmos DB para el laboratorio.

Por qué se hace. Cosmos DB es el servicio administrado donde vivirán los documentos de auditoría. No estamos creando una tabla relacional, sino un espacio para guardar documentos JSON flexibles.

1. Entra a Azure Portal.
1. Busca Azure Cosmos DB.
1. Crea una cuenta nueva.
1. Selecciona el API for NoSQL.
1. Usa el mismo Resource Group del laboratorio para mantener ordenados los recursos.
1. Usa una región coherente con el resto de los servicios.
1. Asigna un nombre único, por ejemplo cosmos-orderhub-tuusuario.

Resultado esperado. Debe existir una cuenta de Cosmos DB creada en Azure y visible dentro del Resource Group del laboratorio.

**Paso 2. Crear database y container**

Qué vamos a hacer. Vamos a crear una base de datos llamada orderhub y un contenedor llamado order-events.

Por qué se hace. El contenedor será el lugar donde guardaremos los eventos de negocio. La partition key sugerida será /orderId para facilitar consultas por orden.

- Database id: orderhub
- Container id: order-events
- Partition key: /orderId

Resultado esperado. Cosmos DB debe tener un contenedor listo para recibir documentos de eventos asociados a órdenes.

7. **Configurar secretos y variables para Cosmos DB**

Qué vamos a hacer. Vamos a preparar la configuración necesaria para que NestJS pueda conectarse a Cosmos DB.

Por qué se hace. Como en semanas anteriores, la información sensible no debe quedar hardcodeada. La connection string de Cosmos DB debe tratarse como secreto. Si en la Semana 6 ya se implementó Key Vault, esta configuración puede guardarse ahí.

Variables sugeridas para desarrollo local:

COSMOS\_ENDPOINT=https://cosmos-orderhub-tuusuario.documents.azure.com:443/ COSMOS\_KEY=tu-primary-key

COSMOS\_DATABASE\_ID=orderhub

COSMOS\_CONTAINER\_ID=order-events

Si se desea seguir la práctica de Key Vault, estos valores pueden almacenarse como secretos con nombres como cosmos-endpoint, cosmos-key, cosmos-database-id y cosmos-container-id. En App Service se puede dejar solamente la URL del Key Vault y permitir que el backend recupere los valores desde SecretsService.

Resultado esperado. El backend tendrá la configuración necesaria para comunicarse con Cosmos DB sin exponer secretos dentro del código fuente.

8. **Preparar NestJS para usar Cosmos DB**

**Paso 3. Instalar el SDK de Cosmos DB**

Qué vamos a hacer. Vamos a instalar el paquete oficial para usar Cosmos DB desde Node.js.

cd src/api

npm install @azure/cosmos

Por qué se hace. NestJS no se conecta a Cosmos DB por sí solo. El SDK nos permite crear clientes, seleccionar bases de datos, contenedores y guardar documentos.

**Paso 4. Crear un módulo de auditoría**

Qué vamos a hacer. Vamos a crear un módulo separado para eventos de auditoría de OrderHub.

Por qué se hace. No debemos mezclar la lógica de auditoría directamente en OrdersService o FilesService. Un módulo audit permite centralizar la escritura de eventos y reutilizarla desde varias partes del backend.

nest g module audit

nest g service audit

nest g controller audit

Resultado esperado. Debe existir una carpeta audit dentro del backend con módulo, servicio y controlador.

9. **Implementar AuditService para registrar eventos**

Archivo sugerido: src/api/src/audit/audit.service.ts

import { Injectable } from '@nestjs/common';

import { CosmosClient } from '@azure/cosmos';

@Injectable()

export class AuditService {

`  `private client: CosmosClient;

`  `constructor() {

`    `this.client = new CosmosClient({

`      `endpoint: process.env.COSMOS\_ENDPOINT!,       key: process.env.COSMOS\_KEY!,

`    `});

`  `}

`  `private getContainer() {

`    `const database = this.client.database(process.env.COSMOS\_DATABASE\_ID!);     return database.container(process.env.COSMOS\_CONTAINER\_ID!);

`  `}

`  `async recordEvent(event: {

`    `orderId: string;

`    `type: string;

`    `userEmail?: string;

`    `data?: Record<string, any>;

`  `}) {

`    `const container = this.getContainer();

`    `const document = {

`      `id: `${event.type}-${event.orderId}-${Date.now()}`,       orderId: event.orderId,

`      `type: event.type,

`      `userEmail: event.userEmail || 'system',

`      `data: event.data || {},

`      `createdAt: new Date().toISOString(),

`    `};

`    `await container.items.create(document);

`    `return document;

`  `}

`  `async findByOrderId(orderId: string) {

`    `const container = this.getContainer();

`    `const query = {

`      `query: 'SELECT \* FROM c WHERE c.orderId = @orderId ORDER BY c.createdAt DESC',       parameters: [{ name: '@orderId', value: orderId }],

`    `};

const { resources } = await container.items.query(query).fetchAll();

`    `return resources;

`  `}

}

Explicación didáctica. recordEvent crea un documento JSON flexible. No obliga a que todos los eventos tengan exactamente las mismas columnas. findByOrderId permite recuperar la historia de una orden usando la partition key propuesta.

10. **Registrar eventos desde OrdersService y FilesService**

**Paso 5. Registrar ORDER\_CREATED al crear una orden**

Qué vamos a hacer. Después de guardar una orden, registraremos un evento en Cosmos DB.

Por qué se hace. La auditoría no reemplaza la operación principal. Primero se crea la orden; luego se deja evidencia de que esa acción ocurrió.

async create(orderDto: Partial<Order>, user?: any) {

`  `const order = this.orderRepository.create(orderDto);

`  `const savedOrder = await this.orderRepository.save(order);

`  `await this.auditService.recordEvent({

`    `orderId: String(savedOrder.id),

`    `type: 'ORDER\_CREATED',

`    `userEmail: user?.email,

`    `data: {

`      `customerId: savedOrder.customerId,

`      `total: savedOrder.total,

`      `status: savedOrder.status,

`    `},

`  `});

`  `return savedOrder;

}

**Paso 6. Registrar FILE\_UPLOADED al subir un archivo**

Qué vamos a hacer. Cuando FilesService suba un archivo a Blob Storage, también registrará un evento en Cosmos DB.

await this.auditService.recordEvent({

`  `orderId: safeOrderId,

`  `type: 'FILE\_UPLOADED',

`  `userEmail: user?.email,

`  `data: {

`    `fileName: file.originalname,

`    `blobName,

`    `contentType: file.mimetype,

`    `size: file.size,

`  `},

});

Resultado esperado. Cada orden tendrá un historial que muestra cuándo fue creada y cuándo se le subieron archivos.

11. **Exponer historial de órdenes al frontend**

**Paso 7. Crear endpoint GET /audit/orders/:orderId**

Qué vamos a hacer. Vamos a exponer un endpoint para que React pueda consultar el historial de una orden.

Por qué se hace. Si el evento queda oculto solamente en Cosmos DB, el estudiante no ve el valor funcional dentro de OrderHub. La UI debe mostrar la evolución del producto.

@UseGuards(JwtAuthGuard)

@Get('orders/:orderId')

findByOrder(@Param('orderId') orderId: string) {

`  `return this.auditService.findByOrderId(orderId);

}

Resultado esperado. Si el usuario autenticado consulta /audit/orders/1, recibirá los eventos asociados a esa orden.

**Paso 8. Crear componente OrderHistory en React**

Qué vamos a hacer. Vamos a crear un componente que reciba selectedOrderId, apiBaseUrl y token, y consulte el historial.

import { useEffect, useState } from 'react';

export default function OrderHistory({ apiBaseUrl, token, selectedOrderId }) {   const [events, setEvents] = useState([]);

`  `useEffect(() => {

`    `if (!selectedOrderId) return;

`    `fetch(`${apiBaseUrl}/audit/orders/${selectedOrderId}`, {

`      `headers: { Authorization: `Bearer ${token}` },

`    `})

.then((res) => res.json())

.then(setEvents)

.catch(console.error);

`  `}, [selectedOrderId]);

`  `return (

`    `<section>

`      `<h3>Historial de la orden</h3>

`      `{events.map((event) => (

`        `<div key={event.id}>

`          `<strong>{event.type}</strong> - {event.createdAt}

`        `</div>

`      `))}

`    `</section>

`  `);

}

12. **Integrar OrderHistory dentro de OrdersPage**

Qué vamos a hacer. Vamos a mantener el enfoque de escalamiento iniciado en la Semana 5. App.jsx sigue controlando la sesión; OrdersPage sigue coordinando la experiencia de órdenes; CreateOrderForm crea órdenes; OrderAttachments sube archivos; y ahora OrderHistory muestra los eventos almacenados en Cosmos DB.

<OrderHistory

`  `apiBaseUrl={apiBaseUrl}

`  `token={token}

`  `selectedOrderId={selectedOrderId}

/>

Por qué se hace. Este paso evita regresar al problema de meter todo en App.jsx. Cada componente tiene una responsabilidad clara:

- App.jsx controla si el usuario está autenticado.
- LoginPage.jsx permite iniciar sesión.
- OrdersPage.jsx coordina la pantalla de órdenes.
- CreateOrderForm.jsx crea órdenes protegidas con JWT.
- OrderAttachments.jsx sube archivos protegidos con JWT.
- OrderHistory.jsx consulta Cosmos DB a través del backend y muestra el historial de la orden.

Resultado esperado. La pantalla de órdenes empieza a sentirse como una herramienta real: permite crear órdenes, subir archivos y ver el historial de acciones asociadas.

13. **Validación local y en Azure para Semana 7**

**Paso 9. Validar el flujo de auditoría**

Qué vamos a hacer. Vamos a crear una orden y verificar que Cosmos DB recibe el evento.

1. Levanta el backend local.
1. Inicia sesión en React.
1. Crea una nueva orden desde CreateOrderForm.
1. Abre Azure Portal y entra al contenedor order-events.
1. Confirma que existe un documento ORDER\_CREATED.
1. Sube un archivo a la orden seleccionada.
1. Confirma que aparece un documento FILE\_UPLOADED.
1. Abre la UI y verifica que OrderHistory muestra los eventos.

Resultado esperado. El estudiante debe poder demostrar la relación entre una acción real de la UI y un documento guardado en Cosmos DB.

**Paso 10. Configurar variables en App Service**

- COSMOS\_ENDPOINT
- COSMOS\_KEY o lectura desde Key Vault
- COSMOS\_DATABASE\_ID
- COSMOS\_CONTAINER\_ID

Si el backend usa SecretsService de la Semana 6, entonces App Service debe tener permisos para leer esos secretos desde Key Vault.

**Semana 8 - Application Insights y observabilidad**

14. **Por qué ahora toca monitoreo**

Una aplicación cloud no está completa solo porque compila y responde. Cuando OrderHub está desplegado, el equipo necesita saber qué está ocurriendo: qué rutas se usan más, qué errores aparecen, cuánto tardan las peticiones, si falló Cosmos DB o si un usuario no autorizado intenta acceder a rutas protegidas.

La Semana 8 introduce observabilidad. Esto significa que OrderHub empezará a producir señales útiles para diagnosticar su comportamiento. Application Insights será el servicio principal para recolectar esas señales.

Caso funcional de la semana 8: cuando el usuario cree órdenes, suba archivos o consulte historial, la API debe registrar trazas, errores y requests visibles desde Azure Portal.

**Conceptos clave de observabilidad**

- Request: una llamada HTTP recibida por la API.
- Trace: mensaje de diagnóstico generado por la aplicación.
- Exception: error capturado o no capturado.
- Dependency: llamada a otro servicio, como Cosmos DB, Key Vault o Blob Storage.
- Metric: valor numérico que permite observar comportamiento, como cantidad de errores o duración promedio.
15. **Crear Application Insights y conectarlo con App Service**

**Paso 11. Crear o habilitar Application Insights**

Qué vamos a hacer. Vamos a habilitar Application Insights para el backend de OrderHub.

Por qué se hace. App Service puede integrarse con Application Insights para capturar telemetría del backend. Esto permite diagnosticar problemas reales sin conectarse manualmente al servidor.

1. Entra al App Service de la API.
1. Busca Application Insights.
1. Habilita Application Insights si aún no existe.
1. Selecciona o crea un recurso nuevo.
1. Guarda la configuración.
1. Reinicia la aplicación si Azure lo solicita.

Resultado esperado. La API debe empezar a enviar información básica de requests y errores hacia Application Insights.

**Paso 12. Confirmar la connection string de Application Insights**

En Application Insights se usa una connection string. Azure puede configurarla automáticamente en App Service, normalmente como APPLICATIONINSIGHTS\_CONNECTION\_STRING. El estudiante debe revisar que exista en Configuration.

16. **Instrumentar NestJS con trazas útiles**

Qué vamos a hacer. Vamos a agregar logs explícitos en puntos importantes del backend.

Por qué se hace. Aunque Application Insights puede capturar requests automáticamente, los mensajes de negocio ayudan mucho a interpretar qué ocurrió.

Ejemplos de trazas útiles:

- Usuario inició sesión correctamente.
- Orden creada con id específico.
- Archivo subido para una orden.
- Evento registrado en Cosmos DB.
- Error al conectar con Cosmos DB.
- Acceso denegado por rol insuficiente.

Ejemplo simple con Logger de NestJS:

import { Logger } from '@nestjs/common';

private readonly logger = new Logger(OrdersService.name);

this.logger.log(`Order created with id ${savedOrder.id}`);

this.logger.error('Error creating order', error.stack);

Resultado esperado. Al revisar los logs en Azure, el estudiante debe poder entender las acciones principales de la aplicación sin leer todo el código.

17. **Crear endpoints de prueba para troubleshooting**

Qué vamos a hacer. Vamos a crear escenarios controlados para enseñar diagnóstico.

Por qué se hace. El estudiante aprende mejor cuando ve errores reales. Un endpoint controlado permite generar un error 500 sin romper la aplicación.

@Get('debug/error')

throwError() {

`  `throw new Error('Error controlado para validar Application Insights'); }

@Get('debug/slow')

async slowRequest() {

`  `await new Promise((resolve) => setTimeout(resolve, 3000));

`  `return { message: 'Respuesta lenta simulada' };

}

Estos endpoints deben usarse solo para laboratorio. En una aplicación productiva se eliminarían o se protegerían adecuadamente.

**Qué debe observar el estudiante**

- El endpoint /debug/error debe aparecer como excepción en Application Insights.
- El endpoint /debug/slow debe mostrar mayor duración en las métricas de requests.
- Las rutas protegidas sin token deben aparecer como 401.
- Las rutas con rol insuficiente deben aparecer como 403.
18. **Usar Application Insights para investigar problemas**

Qué vamos a hacer. Vamos a revisar las secciones principales que un estudiante debe aprender a consultar.

- Live Metrics: permite ver tráfico y errores casi en tiempo real.
- Failures: muestra fallos por endpoint y tipo de excepción.
- Performance: permite ver duración promedio de requests.
- Transaction Search: ayuda a buscar una operación específica.
- Logs: permite usar consultas KQL para analizar datos.

Ejemplos de preguntas de diagnóstico:

- ¿Cuál endpoint está fallando más?
- ¿Los errores ocurren después del despliegue?
- ¿El fallo viene del login, de orders, de files o de audit?
- ¿La API responde lento cuando consulta Cosmos DB?
- ¿Cuántas solicitudes devuelven 401 o 403?

Resultado esperado. El estudiante no solo debe ver gráficos. Debe aprender a formular preguntas y buscar evidencia en la telemetría.

19. **Errores comunes de Semana 7 y Semana 8**



|**Problema observado**|**Posible causa**|**Cómo se corrige o explica**|
| - | - | - |
|Cosmos DB devuelve Unauthorized|COSMOS\_KEY incorrecta o secret mal leído|<p>oRevisar Key Vault, variables de entorno y </p><p>permisos.</p>|
|No aparecen eventos en Cosmos DB|AuditService no se llamó o se usó orderId incorrecto|Revisar OrdersService, FilesService y logs.|
|Consulta por orderId devuelve vacío|Partition key o valor de orderId no coincide|Confirmar que se guarda y consulta el mismo orderId.|
|Application Insights no recibe datos|<p>Connection string no configurada </p><p>o App Service no reiniciado</p>|Revisar Configuration y reiniciar la app.|
|Solo veo errores genéricos|Faltan logs de negocio en NestJS|Agregar Logger en servicios clave.|
|Frontend no muestra historial|No envía token o endpoint incorrecto|Revisar Authorization Bearer y apiBaseUrl.|

**Checklist de entrega**

- Cosmos DB creado con database orderhub y container order-events.
- Partition key definida como /orderId.
- NestJS registra eventos ORDER\_CREATED y FILE\_UPLOADED.
- Existe endpoint protegido para consultar historial de una orden.
- React tiene componente OrderHistory integrado a OrdersPage.
- Application Insights está habilitado para App Service.
- Los requests y errores aparecen en Azure Portal.
- El estudiante puede provocar un error controlado y encontrarlo en Application Insights.
- El estudiante puede explicar por qué Cosmos DB y Application Insights resuelven problemas distintos.
20. **Cierre pedagógico de las semanas 7 y 8**

La unión de estas dos semanas marca un cambio importante en OrderHub. Ya no estamos construyendo únicamente una API con frontend. Estamos construyendo una aplicación cloud que conserva eventos de negocio, permite consultar historial y ofrece herramientas para diagnosticar problemas reales.

Cosmos DB enseña que no todos los datos deben vivir en el mismo modelo. Las órdenes principales pueden ser relacionales, los archivos pueden estar en Blob Storage, los secretos en Key Vault y el historial flexible en Cosmos DB. Esta separación ayuda a que el estudiante piense como desarrollador cloud y no solo como programador de endpoints.

Application Insights enseña que desplegar no es el final del trabajo. Una aplicación en Azure debe poder observarse. Si falla un login, si una orden tarda demasiado o si Cosmos DB rechaza una conexión, el equipo debe tener evidencia para investigar.

Recomendación para el docente. Pida al estudiante que explique el flujo completo: inicio sesión en React, creo una orden, NestJS guarda la orden, registra el evento en Cosmos DB, muestra el historial en React y finalmente reviso en Application Insights que la operación ocurrió. Si puede narrar ese recorrido con claridad, entonces comprendió el valor real de estas semanas.
