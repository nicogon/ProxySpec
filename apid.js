const AssetFactory = require('./assetFactory');

const request = require('superagent');
const assetFactory = new AssetFactory();
const anypointURI = 'https://qax.anypoint.mulesoft.com';
const username = process.env.USER;
const password = process.env.PASSWORD;
const orgId = process.env.ORG_ID;
const userId = process.env.USER_ID;

console.log('>>>', username, password, orgId);

async function getToken() {
  const csResponse = await request
    .post(`${anypointURI}/accounts/login`)
    .send({ username, password })
    .type('application/json');

  return `${csResponse.body.token_type} ${csResponse.body.access_token}`;
}

const createAsset = async ({ assetProps, content, isFirstVersion}) => {
  try{
    const token = await getToken()
    
    assetFactory.setToken(token);
    assetFactory.setOrgid(orgId);
    await assetFactory.setUserId(userId);
    await assetFactory.createAsset({ assetProps, content, isFirstVersion });
  } catch (error) {
    console.log('Error ¯\\_(ツ)_/¯');
    console.log(error);
  }
}

module.exports = createAsset;
