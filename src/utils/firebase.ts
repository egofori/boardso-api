import * as firebase from 'firebase-admin';
import * as firebaseConfig from '../../firebaseServiceAccount.json';
import { ConfigService } from '@nestjs/config';

const config = new ConfigService();

const serviceAccountConfig = firebaseConfig || {};

const serviceAccount: any =
  serviceAccountConfig[config.getOrThrow<string>('NODE_ENV')];

const firebaseParams = {
  type: serviceAccount?.type,
  projectId: serviceAccount?.project_id,
  privateKeyId: serviceAccount?.private_key_id,
  privateKey: serviceAccount?.private_key,
  clientEmail: serviceAccount?.client_email,
  clientId: serviceAccount?.client_id,
  authUri: serviceAccount?.auth_uri,
  tokenUri: serviceAccount?.token_uri,
  authProviderX509CertUrl: serviceAccount?.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount?.client_x509_cert_url,
};

export const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(firebaseParams),
});

export const firebaseAuth = firebaseApp.auth();
