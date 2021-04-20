const AssetFactory = require('./assetFactory');

const assetFactory = new AssetFactory();
const anypointURI = 'https://qax.anypoint.mulesoft.com';
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const orgId = process.env.ORG_ID;

async function getToken() {
  const csResponse = await request
    .post(`${anypointURI}/accounts/login`)
    .send({ username, password })
    .type('application/json');

  return `${csResponse.body.token_type} ${csResponse.body.access_token}`;
}

const createAsset = ({ assetProps, content, isFirstVersion}) => {
  try{
    const token = await getToken()
    await assetFactory.setToken(token);
    await assetFactory.setOrgid(orgId);
    await assetFactory.initializeUser();
    await assetFactory.createAsset({ assetProps, content, isFirstVersion });
  } catch (error) {
    console.log('Error ¯\\_(ツ)_/¯');
    console.log(error);
  }
}

module.exports = createAsset;
