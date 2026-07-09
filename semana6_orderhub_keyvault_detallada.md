**Guía detallada paso a paso**

**Semana 6 de AZ-204![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.001.png)**

Proyecto OrderHub adaptado a React + NestJS

Material para estudiantes principiantes
## **Semana 6 - Azure Key Vault, secretos y configuración segura de OrderHub**

|Objetivo final|Evolucionar OrderHub para que deje de depender de secretos escritos directamente en archivos .env o variables sueltas. El backend NestJS aprenderá a obtener secretos desde Azure Key Vault, App Service usará identidad administrada, y el flujo de login de la Semana 5 seguirá funcionando con una configuración más segura.|
| - | :- |

Cómo usar este material. Esta guía mantiene el mismo estilo pedagógico de las semanas anteriores: explica por qué se incorpora cada paso, cómo se conecta con lo construido en OrderHub, qué debe observar el estudiante y cómo diagnosticar errores reales de configuración, permisos y despliegue.
1. # **Panorama general de la semana**
Objetivo pedagógico. En la Semana 5, OrderHub incorporó autenticación, autorización, JWT, roles y protección de endpoints. Esa funcionalidad funciona, pero depende de un elemento crítico: el secreto usado para firmar y validar los tokens. Si ese secreto queda expuesto, cualquier persona podría falsificar tokens y entrar al sistema.

En la Semana 6, el proyecto debe dar un paso de seguridad. No vamos a cambiar la experiencia principal del usuario en React; el usuario seguirá entrando con login y accediendo a órdenes. Lo que cambia es la forma en que el backend obtiene información sensible. En lugar de depender de valores escritos manualmente en el código o pegados sin control, usaremos Azure Key Vault.

El valor pedagógico de esta semana está en enseñar que la seguridad no termina cuando una ruta queda protegida por JWT. Una aplicación real también debe proteger las claves que hacen posible esa autenticación.

¿Qué preguntas debe ser capaz de responder el estudiante al terminar la semana?

- ¿Qué se considera un secreto dentro de una aplicación?
- ¿Por qué JWT\_SECRET no debe quedar expuesto en el repositorio?
- ¿Qué es Azure Key Vault y qué problema resuelve?
- ¿Qué es una identidad administrada de App Service?
- ¿Cómo puede NestJS leer secretos desde Azure Key Vault?
- ¿Cómo validar que el login de React sigue funcionando cuando el secreto viene de Key Vault?

¿Qué debe quedar listo al terminar la semana? OrderHub debe conservar el flujo de login creado en la Semana 5, pero el secreto de JWT debe estar almacenado en Azure Key Vault. App Service debe tener permiso para leerlo y el backend debe contar con un servicio centralizado para obtener secretos.
2. # **Qué conceptos debe entender el estudiante antes de comenzar**

|**Concepto**|**Explicación**|
| - | - |
|Secreto|Valor sensible que permite acceder o proteger recursos: JWT\_SECRET, contraseñas, connection strings y claves de servicios.|
|Azure Key Vault|Servicio de Azure para almacenar secretos, certificados y claves de forma centralizada y controlada.|
|Managed Identity|Identidad que Azure asigna a un recurso, como App Service, para autenticarse contra otros servicios sin guardar credenciales adicionales.|
|RBAC|Modelo de permisos basado en roles. En esta semana se usa para permitir que App Service lea secretos del Key Vault.|
|DefaultAzureCredential|Clase del SDK de Azure que intenta autenticarse con el entorno disponible: Azure CLI en local o Managed Identity en Azure.|
|Separación de configuración y código|Principio que evita que credenciales o valores sensibles queden escritos directamente en los archivos fuente.|

Punto clave. El estudiante debe entender que Key Vault no reemplaza al login. Key Vault protege secretos que el backend necesita para que el login sea seguro. El flujo visible en React puede ser casi el mismo, pero la arquitectura interna mejora.
3. # **Arquitectura de Semana 6**
La arquitectura general de OrderHub se mantiene: React llama a NestJS, NestJS protege endpoints, las órdenes se mantienen en la base de datos y los archivos pueden seguir subiendo a Blob Storage. Lo nuevo es que NestJS ya no obtiene el JWT\_SECRET directamente de un valor plano, sino desde una capa llamada SecretsService que puede consultar Azure Key Vault.



|**Componente**|**Dónde vive**|**Función en Semana 6**|
| - | - | - |
|React SPA|Azure Static Web Apps / local|Mantiene LoginPage, OrdersPage, CreateOrderForm y OrderAttachments. No lee secretos; solo consume la API.|
|NestJS API|Azure App Service / local|Valida login, genera JWT y consume secretos desde SecretsService.|
|Azure Key Vault|Azure|Almacena secretos como jwt-secret y storage-connection-string.|
|Managed Identity|App Service|Permite que App Service se autentique contra Key Vault sin contraseña.|
|PostgreSQL / Storage|Local / Azure|Siguen funcionando como servicios ya integrados en semanas anteriores.|

Flujo esperado al finalizar la semana:

1. El usuario abre OrderHub en React.
1. LoginPage llama a POST /auth/login.
1. NestJS valida las credenciales.
1. AuthService necesita firmar un JWT.
1. SecretsService obtiene jwt-secret desde Key Vault o desde .env en modo local.
1. NestJS genera el token y lo devuelve a React.
1. React guarda el token y consume /orders con Authorization: Bearer token.
1. El backend valida el token usando el mismo secreto protegido.
4. # **Qué debe quedar listo al terminar la semana**
- El estudiante identifica qué valores de OrderHub son secretos y cuáles son configuración normal.
- Existe un Azure Key Vault creado para el laboratorio.
- Existe un secreto jwt-secret almacenado en Key Vault.
- App Service tiene identidad administrada habilitada.
- La identidad de App Service tiene permiso para leer secretos del Key Vault.
- El backend tiene instalados @azure/keyvault-secrets y @azure/identity.
- Existe un SecretsService dentro de NestJS.
- AuthService o JwtModule obtiene el secreto desde SecretsService.
- El login de React sigue funcionando sin cambios grandes en la UI.
- El estudiante puede diagnosticar errores Forbidden, Secret not found y URL incorrecta.

Esta semana se considera completa cuando el estudiante puede explicar que la seguridad no consiste solo en proteger endpoints, sino también en proteger los secretos que hacen posible esa protección.
5. # **Revisión inicial antes de crear Key Vault**
## **Paso 1. Confirmar que la Semana 5 funciona**
Qué vamos a hacer. Vamos a validar que el login, los roles y las rutas protegidas funcionan antes de cambiar la forma en que se obtiene el secreto JWT.

Por qué se hace. Si el login ya estaba fallando, Key Vault no es el problema. Primero se debe comprobar la base heredada.

cd src/api![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.002.png)

npm install

npm run build

npm run start:dev

- Probar login

curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@orderhub.com","password":"Admin123"}'

Resultado esperado. La API debe devolver un accessToken y los datos del usuario. En React, LoginPage debe permitir entrar a OrdersPage.
## **Paso 2. Identificar los secretos actuales de OrderHub**
Qué vamos a hacer. Vamos a revisar qué valores sensibles existen en el backend.

- JWT\_SECRET: secreto para firmar y validar tokens.
- DB\_PASSWORD: contraseña de base de datos.
- AZURE\_STORAGE\_CONNECTION\_STRING: cadena de conexión de Blob Storage.
- Cualquier clave futura de servicios externos.

Resultado esperado. El estudiante entiende que no todas las variables son iguales: APP\_ENV o PORT son configuración; JWT\_SECRET y connection strings son secretos.
6. # **Crear Azure Key Vault y guardar secretos**
## **Paso 3. Crear el recurso Key Vault**
Qué vamos a hacer. Vamos a crear un Key Vault dentro del mismo Resource Group del laboratorio. Por qué se hace. Key Vault será el almacén centralizado de secretos de OrderHub.

- Entra a Azure Portal.
- Busca Key Vaults.
- Selecciona Create.
- Usa el mismo Resource Group del proyecto.
- Elige una región coherente con App Service.
- Usa un nombre único, por ejemplo kv-orderhub-tuusuario-dev.

Alternativa con Azure CLI:

az keyvault create   --name kv-orderhub-tuusuario-dev   --resource-group rg-orderhub-dev   --location eastus![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.003.png)
## **Paso 4. Guardar el secreto jwt-secret**
Qué vamos a hacer. Vamos a mover el secreto de JWT desde .env hacia Key Vault.

az keyvault secret set   --vault-name kv-orderhub-tuusuario-dev   --name jwt-secret   --value "cambia-este-valor-por- uno-largo-y-seguro"![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.004.png)

Nota para estudiantes. En Key Vault los nombres suelen escribirse con guiones, como jwt-secret. En .env normalmente se usan mayúsculas y guiones bajos, como JWT\_SECRET. El código debe saber traducir esa diferencia.
7. # **Habilitar Managed Identity en App Service**
## **Paso 5. Activar identidad administrada**
Qué vamos a hacer. Vamos a darle a App Service una identidad propia dentro de Azure.

Por qué se hace. Si App Service tiene identidad administrada, puede autenticarse contra Key Vault sin guardar client secret, usuario ni contraseña.

- Entra al App Service de la API.
- Busca Identity.
- En la pestaña System assigned cambia Status a On.
- Guarda los cambios.
- Copia o identifica el Object ID si Azure lo muestra.

Resultado esperado. El App Service tendrá una identidad que se puede usar para asignar permisos en Key Vault.
## **Paso 6. Dar permisos de lectura de secretos**
Qué vamos a hacer. Vamos a permitir que App Service lea secretos del Key Vault. Por qué se hace. Tener identidad no basta. La identidad necesita autorización.

- Entra al Key Vault.
- Ve a Access control (IAM) si usas RBAC.
- Agrega role assignment.
- Selecciona el rol Key Vault Secrets User.
- Selecciona la identidad administrada del App Service.
- Guarda la asignación.

Resultado esperado. El App Service puede leer secretos, pero no necesariamente administrarlos. Esto respeta el principio de mínimo privilegio.
8. # **Preparar NestJS para leer secretos**
## **Paso 7. Instalar SDKs de Azure**
Qué vamos a hacer. Vamos a instalar las librerías necesarias para consumir Key Vault desde NestJS.

cd src/api![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.005.png)

npm install @azure/keyvault-secrets @azure/identity

Por qué se hace. @azure/keyvault-secrets permite leer secretos y @azure/identity permite autenticarse usando Azure CLI localmente o Managed Identity en Azure.
## **Paso 8. Crear el módulo secrets**
Qué vamos a hacer. Vamos a crear un módulo dedicado para secretos.

Por qué se hace. No queremos que cada servicio del backend se conecte a Key Vault por su cuenta. Centralizarlo hace el código más claro y mantenible.

nest g module secrets![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.006.png)

nest g service secrets

Resultado esperado. Debe existir src/api/src/secrets con un SecretsModule y un SecretsService.
9. # **Implementar SecretsService con fallback local**
Qué vamos a hacer. Vamos a crear un servicio que lea secretos desde Key Vault cuando exista AZURE\_KEY\_VAULT\_URL, pero que permita usar .env en local para facilitar el aprendizaje.

Por qué se hace. Los estudiantes necesitan poder trabajar localmente sin pelearse inmediatamente con permisos de Azure. Pero en Azure la app debe usar Key Vault.

import { Injectable } from '@nestjs/common';![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.007.png)

import { SecretClient } from '@azure/keyvault-secrets';

import { DefaultAzureCredential } from '@azure/identity';

@Injectable()

export class SecretsService {

`  `private client?: SecretClient;

`  `private cache = new Map<string, string>();

`  `constructor() {

`    `const vaultUrl = process.env.AZURE\_KEY\_VAULT\_URL;

`    `if (vaultUrl) {

`      `const credential = new DefaultAzureCredential();

`      `this.client = new SecretClient(vaultUrl, credential);

`    `}

`  `}

`  `async getSecret(secretName: string, envFallbackName?: string): Promise<string> {     if (this.cache.has(secretName)) {

`      `return this.cache.get(secretName)!;

`    `}

`    `if (this.client) {

`      `const secret = await this.client.getSecret(secretName);

`      `const value = secret.value;

`      `if (!value) {

`        `throw new Error(`Secret ${secretName} has no value`);

`      `}

`      `this.cache.set(secretName, value);

`      `return value;

`    `}

const fallback = envFallbackName ? process.env[envFallbackName] : undefined;

`    `if (!fallback) {

`      `throw new Error(`Missing secret ${secretName} and fallback ${envFallbackName}`);     }

`    `this.cache.set(secretName, fallback);

`    `return fallback;

`  `}

}

Explicación didáctica. El cache evita pedir el secreto a Key Vault en cada request. El fallback local permite que el estudiante use JWT\_SECRET en .env mientras trabaja en su máquina.
10. # **Usar Key Vault para firmar JWT**
## **Paso 9. Ajustar AuthService**
Qué vamos a hacer. Vamos a modificar el servicio de autenticación para obtener el secreto JWT desde SecretsService.

Por qué se hace. Esta es la conexión directa con la Semana 5: el login sigue igual para React, pero el secreto que firma el token ahora viene de un almacén seguro.

@Injectable()![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.008.png)

export class AuthService {

`  `constructor(

`    `private readonly jwtService: JwtService,

`    `private readonly secretsService: SecretsService,

`  `) {}

`  `async login(user: User) {

`    `const jwtSecret = await this.secretsService.getSecret(

`      `'jwt-secret',

`      `'JWT\_SECRET',

`    `);

`    `const payload = {

`      `sub: user.id,

`      `email: user.email,

`      `role: user.role,

`    `};

`    `const accessToken = await this.jwtService.signAsync(payload, {

`      `secret: jwtSecret,

`    `});

`    `return {

`      `accessToken,

`      `user: {

`        `id: user.id,

`        `email: user.email,

`        `role: user.role,

`      `},

`    `};

`  `}

}

Nota importante. Si en la Semana 5 se configuró JwtModule con secret fijo, en esta semana se puede mantener JwtService y pasar el secret en signAsync. Para validar tokens en JwtStrategy también se debe usar el mismo secreto o configurar una estrategia que pueda leerlo.
11. # **Ajustar JwtStrategy para validar con el secreto correcto**
Qué vamos a hacer. Vamos a asegurarnos de que la validación del token use el mismo secreto protegido.

Por qué se hace. No basta con firmar el token usando Key Vault. También hay que validarlo usando el mismo secreto.

@Injectable()![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.009.png)

export class JwtStrategy extends PassportStrategy(Strategy) {

`  `constructor(private readonly secretsService: SecretsService) {

`    `super({

`      `jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

`      `ignoreExpiration: false,

`      `secretOrKeyProvider: async (request, rawJwtToken, done) => {

`        `try {

`          `const secret = await secretsService.getSecret('jwt-secret', 'JWT\_SECRET');           done(null, secret);

`        `} catch (error) {

`          `done(error, null);

`        `}

`      `},

`    `});

`  `}

`  `async validate(payload: any) {

`    `return {

`      `id: payload.sub,

`      `email: payload.email,

`      `role: payload.role,

`    `};

`  `}

}

Explicación. secretOrKeyProvider permite resolver el secreto de forma dinámica. Esto ayuda cuando el secreto no está escrito directamente en el módulo, sino que viene de otro servicio.

Resultado esperado. El endpoint /auth/login genera tokens y los endpoints protegidos siguen aceptando esos tokens.
12. # **¿Qué cambia en React durante la Semana 6?**
Qué vamos a hacer. En React no vamos a reescribir el login. LoginPage, App.jsx, OrdersPage, CreateOrderForm y OrderAttachments siguen funcionando como en Semana 5.

Por qué se hace. Esta semana enseña una idea importante: mejorar la seguridad del backend no siempre implica cambiar la interfaz. El usuario sigue iniciando sesión igual, pero la forma en que el servidor firma el token es más segura.

El flujo en React sigue siendo:

1. LoginPage captura email y password.
1. LoginPage llama a POST /auth/login.
1. El backend responde accessToken y user.
1. App.jsx guarda token y user en localStorage.
1. OrdersPage consume /orders enviando Authorization: Bearer token.
1. CreateOrderForm y OrderAttachments también envían el token.

Validación visual recomendada. Después de desplegar los cambios del backend, el estudiante debe abrir el frontend y confirmar que:

- El login sigue permitiendo entrar.
- OrdersPage carga órdenes protegidas.
- CreateOrderForm crea órdenes con token.
- OrderAttachments sigue subiendo archivos con token.
- Cerrar sesión elimina token y user del localStorage.

Mensaje pedagógico. React no conoce Key Vault. React solo ve que el login funciona. Key Vault vive del lado del backend y protege los secretos del servidor.
13. # **Configuración en Azure App Service y despliegue**
## **Paso 10. Agregar variables necesarias en App Service**
Qué vamos a hacer. Vamos a configurar la URL del Key Vault en App Service.

- Entrar al App Service de la API.
- Ir a Configuration.
- Agregar AZURE\_KEY\_VAULT\_URL con el valor del vault, por ejemplo https://kv-orderhub-tuusuario- dev.vault.azure.net/.
- Guardar y reiniciar si Azure lo solicita.

Nota. En Azure, JWT\_SECRET ya no debería ser obligatorio si el backend puede leer jwt-secret desde Key Vault. Para desarrollo local sí puede permanecer en .env.
## **Paso 11. Desplegar el backend actualizado**
Qué vamos a hacer. Vamos a publicar la versión que incluye SecretsService y los cambios de AuthService/JwtStrategy.

Por qué se hace. Key Vault no cambia React por sí solo. El backend debe incluir el código que sabe leer secretos.

- Confirmar que el workflow del backend sigue usando working-directory: src/api.
- Confirmar que el artifact sube solo src/api.
- Hacer commit y push.
- Esperar el workflow en GitHub Actions.
- Probar /auth/login en la URL pública.

curl -X POST https://tu-api.azurewebsites.net/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@orderhub.com","password":"Admin123"}'![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.010.png)

Resultado esperado. La API pública devuelve un accessToken válido.
14. # **Pruebas locales y pruebas en Azure**
## **Prueba local con fallback .env**
Qué vamos a hacer. Vamos a comprobar que el backend puede seguir funcionando localmente usando JWT\_SECRET desde .env.

- src/api/.env\
  JWT\_SECRET=local-dev-secret\
  APP\_ENV=development![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.011.png)

  npm run start:dev

  Luego prueba login y /orders con token.
  ## **Prueba local usando Azure CLI**
  Qué vamos a hacer. Opcionalmente, el estudiante puede probar Key Vault desde su máquina usando DefaultAzureCredential y az login.

  az login![](Aspose.Words.afec551c-51cf-4e01-a104-056f4c9f324e.012.png)

  export AZURE\_KEY\_VAULT\_URL=https://kv-orderhub-tuusuario-dev.vault.azure.net/ npm run start:dev

  En Windows, se puede configurar la variable desde PowerShell o usar un archivo .env si el proyecto lo carga.
  ## **Prueba en Azure**
1. Abrir el frontend público.
1. Iniciar sesión con el usuario de prueba.
1. Confirmar que OrdersPage carga datos protegidos.
1. Crear una orden si el rol lo permite.
1. Subir un archivo si el rol lo permite.
1. Revisar logs de App Service si algo falla.

Si el login falla solo en Azure, el sospechoso principal será la conexión entre App Service, Managed Identity y Key Vault.
# **15. Errores comunes, checklist y cierre pedagógico**
## **Errores comunes y cómo explicarlos en clase**

|**Problema observado**|**Posible causa**|**Cómo se explica o corrige**|
| - | - | - |
|Forbidden al leer Key Vault|App Service no tiene rol Key Vault Secrets User|Asignar permiso a la identidad administrada correcta y esperar unos minutos.|
|Secret not found|El nombre del secreto en código no coincide con Key Vault|Confirmar que el secreto se llama jwt-secret y no JWT\_SECRET.|
|getaddrinfo ENOTFOUND|AZURE\_KEY\_VAULT\_URL mal escrita|Revisar que la URL termine en vault.azure.net y tenga https://.|
|Login funciona local pero no en Azure|En local usa .env, pero Azure no puede leer Key Vault|Revisar identidad, permisos, URL y logs.|
|Token se genera pero endpoints protegidos fallan|JwtStrategy valida con otro secreto|Asegurar que firma y validación usan SecretsService.|
## **Checklist de entrega de la semana**
- Existe un Key Vault creado para OrderHub.
- Existe el secreto jwt-secret en Key Vault.
- App Service tiene Managed Identity habilitada.
- La identidad de App Service tiene permiso para leer secretos.
- El backend tiene @azure/keyvault-secrets y @azure/identity instalados.
- Existe SecretsService con fallback local.
- AuthService firma tokens usando el secreto obtenido por SecretsService.
- JwtStrategy valida tokens con el mismo secreto.
- LoginPage sigue funcionando en React.
- OrdersPage, CreateOrderForm y OrderAttachments siguen consumiendo endpoints protegidos con token.
- El estudiante puede explicar por qué Key Vault mejora la seguridad de OrderHub.
## **Cierre pedagógico de la semana**
Lo más importante de esta semana no es solo crear un Key Vault. Lo importante es que el estudiante entienda que la seguridad de una aplicación no termina en escribir un Guard o proteger una ruta. Si el secreto que firma los tokens queda expuesto, toda la autenticación pierde valor.

Con esta práctica, OrderHub conserva el mismo comportamiento funcional para el usuario, pero mejora internamente su postura de seguridad. Esa es una lección esencial de desarrollo cloud: muchas mejoras importantes no se ven en la pantalla, pero hacen que la aplicación sea más confiable, segura y preparada para producción.
