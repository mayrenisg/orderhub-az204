**Guía detallada paso a paso**

**Semana 9 de AZ-204**

Proyecto OrderHub adaptado a React + NestJS

Material para estudiantes principiantes![](Aspose.Words.7b02ab13-8e57-4f79-be29-47709dab0128.001.png)

**Semana 9 – Azure Functions, procesamiento asíncrono y Azure SQL para E2E cloud**



|**Objetivo final**|Evolucionar OrderHub para que pueda ejecutar un flujo completo de punta a punta desde la nube: React desplegado, API NestJS en App Service, base de datos Azure SQL, secretos protegidos con Key Vault, mensajes asíncronos en una cola y una Azure Function que procese eventos de órdenes sin bloquear la solicitud HTTP del usuario.|
| - | :- |

Cómo usar este material. Esta guía mantiene el mismo estilo pedagógico de las semanas anteriores. No solo indica qué crear; explica por qué se crea, cómo se conecta con OrderHub, qué debe observar el estudiante, qué errores pueden aparecer y cómo validar que el flujo E2E cloud realmente funciona.

1. **Panorama general de la semana**

Objetivo pedagógico. En semanas anteriores OrderHub ya avanzó bastante: React consume una API, NestJS maneja órdenes, archivos y autenticación, Key Vault protege secretos y Cosmos DB/Application Insights introdujeron servicios administrados de Azure. La Semana 9 une varias piezas para enseñar una idea central de aplicaciones cloud: no todo debe resolverse dentro de la misma petición HTTP.

Hasta ahora, cuando el usuario crea una orden, la API puede guardar datos y responder. Eso funciona, pero en sistemas reales muchas tareas posteriores deben ejecutarse de forma asíncrona: notificar, auditar, generar estados, procesar archivos o iniciar flujos de negocio. En esta práctica, OrderHub publicará un mensaje cuando se cree una orden y una Azure Function se encargará de procesarlo.

Además, como plus importante, esta semana incorpora Azure SQL Database para que el despliegue pueda probarse completamente desde la nube. La idea es que los estudiantes ya no dependan de una base local para validar el sistema desplegado.

Preguntas que debe poder responder el estudiante al terminar:

- ¿Por qué no conviene ejecutar todas las tareas dentro del request HTTP?
- ¿Qué es una cola y por qué ayuda a desacoplar procesos?
- ¿Qué es una Azure Function y cómo se activa con mensajes?
- ¿Cómo cambia OrderHub al usar Azure SQL en lugar de una base local?
- ¿Cómo se valida un flujo end-to-end desde React hasta Azure SQL y Azure Functions?
2. **Qué conceptos debe entender el estudiante antes de comenzar**

Procesamiento síncrono. Es el flujo donde el usuario espera a que todo se complete antes de recibir una respuesta. Por ejemplo, crear una orden y esperar a que el backend guarde, procese, notifique y audite todo en la misma llamada.

Procesamiento asíncrono. Es el flujo donde el backend responde rápido y deja ciertas tareas para ejecutarse después. Esto mejora la experiencia del usuario y hace la arquitectura más resistente.

Cola de mensajes. Es un mecanismo donde un sistema publica mensajes y otro sistema los consume. En esta semana usaremos Azure Storage Queue porque es simple y suficiente para enseñar el patrón productor/consumidor.

Azure Functions. Es un servicio serverless de Azure que ejecuta código cuando ocurre un evento. En esta práctica, una función se activará cuando llegue un mensaje a la cola.

Azure SQL Database. Es una base de datos relacional administrada en Azure. Permite que OrderHub guarde y consulte órdenes desde la nube, sin depender de PostgreSQL local.

E2E cloud. Significa end-to-end desde la nube: el usuario entra al frontend desplegado, crea una orden, la API se ejecuta en App Service, la información se guarda en Azure SQL y una función procesa un mensaje en segundo plano.

3. **Arquitectura de Semana 9**

La arquitectura de OrderHub se amplía para combinar persistencia cloud y procesamiento asíncrono. La API sigue siendo el centro del flujo de negocio, pero ahora delega trabajos posteriores a una cola y a una Azure Function.



|Componente|Servicio / ubicación|Función en Semana 9|
| - | - | - |
|React SPA|Azure Static Web Apps|Permite iniciar sesión, listar órdenes, crear órdenes y refrescar estados procesados.|
|NestJS API|Azure App Service|Recibe solicitudes autenticadas, guarda órdenes en Azure SQL y publica mensajes en la cola.|
|Azure SQL Database|Azure SQL|Guarda las órdenes reales para el E2E cloud.|
|Azure Storage Queue|Azure Storage|Recibe eventos como OrderCreated para procesamiento posterior.|
|Azure Function|Azure Functions|Consume mensajes de la cola y actualiza estado o crea registros de procesamiento.|
|Azure Key Vault|Azure|Protege secretos como SQL password y queue connection string.|
|Application Insights|Azure Monitor|Permite observar logs, errores y ejecución de funciones.|

Flujo esperado: React crea una orden -> NestJS valida JWT -> NestJS guarda en Azure SQL -> NestJS envía mensaje a Storage Queue -> Azure Function procesa el mensaje -> la orden queda con estado actualizado o con un registro 

de procesamiento visible.

4. **Qué debe quedar listo al terminar la semana**
- Azure SQL Server y Azure SQL Database creados.
- Reglas de firewall configuradas para permitir pruebas y acceso desde servicios Azure.
- Backend NestJS configurado para conectarse a Azure SQL usando TypeORM y driver mssql.
- Secretos de SQL y cola protegidos en Key Vault o referenciados desde App Service.
- Storage Queue creada para mensajes de procesamiento.
- NestJS publica un mensaje cuando se crea una orden.
- Azure Function consume mensajes de la cola.
- La Function actualiza estado o registra procesamiento de la orden.
- React permite crear una orden y refrescar para ver el resultado procesado.
- El estudiante puede demostrar el flujo E2E desde la URL pública del frontend.

Esta semana no busca solamente crear recursos. Busca que el estudiante entienda cómo un producto empieza a comportarse como una solución cloud real: con datos persistentes, procesos desacoplados y observabilidad básica.

5. **Revisión inicial antes de crear recursos**

**Paso 1. Confirmar que OrderHub sigue funcionando**

Qué vamos a hacer. Validaremos que el frontend, backend, login, órdenes y adjuntos siguen operando antes de introducir Azure SQL y Azure Functions.

Por qué se hace. Si la base de semanas anteriores está rota, cualquier nuevo error se mezclará con problemas viejos. Antes de tocar recursos cloud nuevos, debemos partir de un sistema sano.

cd src/api

npm install

npm run build

npm run start:dev

cd ../ui

npm install

npm run dev

Resultado esperado. El estudiante debe poder iniciar sesión, consultar órdenes y confirmar que la API responde /health.

**Paso 2. Identificar qué cambia esta semana**

No vamos a eliminar lo anterior. Vamos a reemplazar la dependencia de base local por una base Azure SQL para el E2E cloud y vamos a agregar un proceso asíncrono que comienza cuando se crea una orden.

6. **Crear Azure SQL Server y Azure SQL Database**

**Paso 3. Crear el servidor SQL**

Qué vamos a hacer. Crearemos un Azure SQL Server, que actúa como contenedor lógico para una o varias bases de datos.

Por qué se hace. Azure SQL Database necesita un servidor lógico para gestionar conexiones, firewall, usuario administrador y seguridad.

1. Entrar a Azure Portal.
1. Buscar Azure SQL o SQL databases.
1. Crear un servidor nuevo.
1. Asignar un nombre único, por ejemplo sql-orderhub-tuusuario.
1. Crear usuario administrador, por ejemplo sqladmin.
1. Guardar la contraseña de forma segura, idealmente en Key Vault.
1. Seleccionar la misma región usada para App Service cuando sea posible.

**Paso 4. Crear la base de datos orderhubdb**

1. Dentro del proceso de creación, seleccionar Create database.
1. Nombre sugerido: orderhubdb.
1. Para laboratorio, usar un tier económico.
1. Finalizar la creación y esperar el despliegue.

Resultado esperado. Debe existir un SQL Server y una base de datos orderhubdb disponibles en Azure.

7. **Configurar firewall, secretos y variables**

**Paso 5. Configurar acceso de red**

Qué vamos a hacer. Permitiremos que App Service pueda conectarse a Azure SQL y, si hace falta, agregaremos la IP del estudiante para pruebas desde su equipo.

Por qué se hace. Azure SQL bloquea conexiones no autorizadas por defecto. Si no configuramos firewall, la API no podrá conectarse aunque las credenciales estén bien.

- Activar Allow Azure services and resources to access this server si el laboratorio lo permite.
- Agregar la IP pública del estudiante para pruebas con Azure Data Studio o DBeaver.
- No abrir rangos amplios innecesarios en entornos reales.

**Paso 6. Guardar secretos**

En Key Vault o App Service se deben preparar estos valores:

DB\_TYPE=mssql

DB\_HOST=sql-orderhub-tuusuario.database.windows.net

DB\_PORT=1433

DB\_USERNAME=sqladmin

DB\_PASSWORD=<password-en-key-vault>

DB\_NAME=orderhubdb

QUEUE\_NAME=order-processing AZURE\_STORAGE\_CONNECTION\_STRING=<storage-connection-string>

Nota didáctica. La Semana 6 ya enseñó Key Vault; por eso esta semana debe reforzar que la contraseña SQL y la connection string de Storage Queue no pertenecen al código fuente.

8. **Ajustar NestJS para Azure SQL**

**Paso 7. Instalar driver mssql**

Qué vamos a hacer. Instalaremos el driver que TypeORM usa para comunicarse con SQL Server/Azure SQL.

cd src/api

npm install mssql

**Paso 8. Ajustar la configuración TypeORM**

Qué vamos a hacer. Permitiremos que el backend se conecte a Azure SQL cuando DB\_TYPE sea mssql.

TypeOrmModule.forRoot({

`  `type: 'mssql',

`  `host: process.env.DB\_HOST,

`  `port: Number(process.env.DB\_PORT || 1433),

`  `username: process.env.DB\_USERNAME,

`  `password: process.env.DB\_PASSWORD,

`  `database: process.env.DB\_NAME,

`  `autoLoadEntities: true,

`  `synchronize: true, // solo para laboratorio

`  `options: {

`    `encrypt: true,

`    `trustServerCertificate: false,

`  `},

})

Explicación. encrypt: true es necesario para conexiones seguras hacia Azure SQL. synchronize: true puede ayudar en laboratorio, pero en producción real se recomienda trabajar con migraciones.

9. **Revisar entidad Order para Azure SQL**

La entidad de órdenes debe ser compatible con SQL Server. Se recomienda incluir fechas y un estado que permita ver el procesamiento asíncrono.

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')

export class Order {

`  `@PrimaryGeneratedColumn()

`  `id: number;

`  `@Column()

`  `customerId: string;

`  `@Column('decimal', { precision: 10, scale: 2 })

`  `total: number;

`  `@Column({ default: 'Pending' })

`  `status: string;

`  `@CreateDateColumn()

`  `createdAt: Date;

}

Qué cambia. Ahora status no solo representa el estado manual de la orden. También permitirá ver si el proceso asíncrono ya pasó por la Function. Por ejemplo: Pending -> Processing -> Processed.

Resultado esperado. Al crear una orden, TypeORM debe crear un registro en Azure SQL y devolver un id real desde la nube.

10. **Crear Azure Storage Queue**

**Paso 9. Crear la cola order-processing**

Qué vamos a hacer. Vamos a crear una cola que reciba eventos de órdenes creadas.

Por qué se hace. La cola desacopla la creación de la orden del procesamiento posterior. La API no espera a que todo termine; solo publica un mensaje para que otro componente lo procese.

1. Entrar a la Storage Account usada por OrderHub.
1. Ir a Queues.
1. Crear una queue llamada order-processing.
1. Confirmar que aparece en el listado.

**Paso 10. Instalar SDK en NestJS**

cd src/api

npm install @azure/storage-queue

**Paso 11. Crear QueueService**

import { Injectable } from '@nestjs/common';

import { QueueClient } from '@azure/storage-queue';

@Injectable()

export class QueueService {

`  `private client = new QueueClient(

`    `process.env.AZURE\_STORAGE\_CONNECTION\_STRING!,

`    `process.env.QUEUE\_NAME || 'order-processing',

`  `);

`  `async sendOrderCreated(orderId: number) {

`    `const message = Buffer.from(JSON.stringify({ orderId })).toString('base64');     await this.client.sendMessage(message);

`  `}

}

11. **Publicar mensaje al crear una orden**

**Paso 12. Integrar QueueService en OrdersService**

Qué vamos a hacer. Después de guardar la orden en Azure SQL, publicaremos un mensaje en la cola.

Por qué se hace. La API debe responder rápido, pero también debe dejar constancia de que hay trabajo posterior pendiente.

async create(orderDto: Partial<Order>) {

`  `const order = this.orderRepository.create({

...orderDto,

`    `status: 'Pending',

`  `});

`  `const savedOrder = await this.orderRepository.save(order);

`  `await this.queueService.sendOrderCreated(savedOrder.id);

`  `return savedOrder;

}

Explicación. Primero se guarda la orden. Luego se envía el mensaje. El usuario recibe respuesta sin esperar a que la Function termine. Esto enseña una separación muy importante entre la acción principal y el procesamiento secundario.

Resultado esperado. Cada vez que se cree una orden desde React o Postman, debe aparecer un mensaje en la cola order-processing.

12. **Crear Azure Function para procesar la cola**

**Paso 13. Crear proyecto de Azure Functions**

Qué vamos a hacer. Crearemos una función que se active cuando llegue un mensaje a la cola.

Por qué se hace. Azure Functions permite ejecutar procesamiento en background sin crear otro servidor completo.

func init orderhub-functions --worker-runtime node --language typescript

cd orderhub-functions

func new --name ProcessOrderQueue --template "Azure Queue Storage trigger"

La función debe escuchar la cola order-processing. En local.settings.json o en Azure Function App se configurará la connection string de Storage.

**Paso 14. Lógica de procesamiento**

import { AzureFunction, Context } from '@azure/functions';

const queueTrigger: AzureFunction = async function (context: Context, message: any): Promise<void> {   context.log('Processing order event:', message);

`  `const orderId = message.orderId;

`  `// En el laboratorio, aquí se actualizará la orden a Processed usando Azure SQL.

};

export default queueTrigger;

En una versión más completa, la Function se conectará a Azure SQL y actualizará el estado de la orden. Para estudiantes, se puede comenzar logueando el mensaje y luego agregar la actualización.

13. **Actualizar estado desde la Function**

Para que el E2E sea visible, la Function debe actualizar la orden en Azure SQL. Esto permite que React muestre que la orden ya fue procesada.

import \* as sql from 'mssql';

export async function updateOrderStatus(orderId: number) {

`  `const pool = await sql.connect({

`    `user: process.env.DB\_USERNAME,

`    `password: process.env.DB\_PASSWORD,

`    `server: process.env.DB\_HOST,

`    `database: process.env.DB\_NAME,

`    `options: { encrypt: true },

`  `});

`  `await pool.request()

.input('id', sql.Int, orderId)

.query("UPDATE orders SET status = 'Processed' WHERE id = @id"); }

Qué debe entender el estudiante. Esta función no responde directamente al usuario. Su trabajo ocurre después, cuando la cola le entrega el mensaje. Esa es la esencia del procesamiento asíncrono.

Resultado esperado. Si el usuario crea una orden y luego refresca la lista, el estado eventualmente debe pasar a Processed.

14. **Ajustes en React para mostrar E2E cloud**

El frontend no necesita saber cómo funciona la cola ni la Azure Function. Su responsabilidad es crear órdenes y refrescar la lista para mostrar el estado actualizado.

**Paso 15. Ajustar CreateOrderForm**

El formulario de creación sigue enviando POST /orders con el token JWT. La diferencia es que ahora esa orden se guarda en Azure SQL y dispara un evento a la cola.

**Paso 16. Agregar botón de refrescar en OrdersPage**

<button onClick={fetchOrders}>

`  `Refrescar órdenes

</button>

Explicación. Como el procesamiento ocurre en background, el usuario puede ver inicialmente Pending y luego, al refrescar, ver Processed. Esto ayuda a entender que el proceso no es instantáneo ni parte directa del request HTTP.

Mensaje pedagógico para estudiantes. React no llama a la Function directamente. React habla con la API. La API publica el mensaje. La Function trabaja en segundo plano. Esa separación es clave en aplicaciones cloud.

15. **Despliegue y validación E2E desde la nube**

**Paso 17. Configurar App Service**

- Agregar variables de Azure SQL en Configuration.
- Agregar AZURE\_STORAGE\_CONNECTION\_STRING y QUEUE\_NAME.
- Confirmar que JWT\_SECRET sigue funcionando desde Key Vault.
- Redeployar backend desde GitHub Actions.

**Paso 18. Desplegar Azure Function**

func azure functionapp publish func-orderhub-tuusuario

**Paso 19. Prueba completa**

1. Abrir la URL pública del frontend.
1. Iniciar sesión.
1. Crear una orden.
1. Confirmar que aparece en Azure SQL.
1. Confirmar que se publica mensaje en la cola.
1. Ver logs de Azure Function.
1. Refrescar la lista en React.
1. Confirmar que la orden cambia a Processed.

Resultado esperado. El estudiante puede demostrar un flujo completo desde la nube sin depender de su base local.

16. **Errores comunes y cómo explicarlos en clase**



|Problema observado|Posible causa|Cómo se explica o corrige|
| - | - | - |
|La API no conecta a Azure SQL|Firewall bloqueado o variables incorrectas|Revisar firewall, host, puerto 1433, usuario y password.|
|Login funciona pero crear orden falla|DB\_TYPE o conexión SQL mal configurada|Revisar logs de App Service y TypeORM.|
|No aparece mensaje en la cola|QueueService no fue llamado o connection string incorrecta|Probar creación de orden y revisar Storage Queue.|
|La Function no se ejecuta|Trigger mal configurado o connection string faltante|Revisar Application Settings de Function App.|
|La orden nunca cambia a Processed|La Function no actualiza SQL o no tiene permisos/conexión|Revisar logs, DB\_HOST, DB\_PASSWORD y query SQL.|

17. **Checklist de entrega**
- Azure SQL Server y base orderhubdb creados.
- Firewall configurado.
- Backend conecta a Azure SQL.
- Storage Queue order-processing creada.
- OrdersService publica mensaje al crear orden.
- Azure Function consume la cola.
- Function actualiza estado o registra procesamiento.
- Frontend permite crear orden y refrescar estado.
- E2E cloud demostrado desde la URL pública.
- El estudiante puede explicar procesamiento asíncrono y desacoplamiento.
18. **Cierre pedagógico de la semana**

La Semana 9 es una de las más importantes del curso porque une varios conceptos que en semanas anteriores se estudiaron por separado. Ahora OrderHub ya no es solamente una API con frontend. Se convierte en una solución cloud donde el usuario crea una orden, la API persiste datos en Azure SQL, se publica un evento en una cola y una Azure Function procesa trabajo en segundo plano.

El punto más importante no es memorizar comandos. Lo importante es que el estudiante pueda narrar el flujo completo: inicio sesión, creo una orden desde React, NestJS valida el token, guarda en Azure SQL, publica un mensaje, la Function procesa el evento y el estado se refleja luego en la interfaz.

Recomendación para el docente. Pida al estudiante que explique qué parte es síncrona y qué parte es asíncrona. Si puede distinguir entre crear la orden y procesarla después, habrá entendido una de las ideas más importantes de la arquitectura cloud moderna.
