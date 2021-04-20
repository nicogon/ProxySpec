const ApiDesignerClient = require('@mulesoft/api-designer-xapi-js-client');

const apiDesignerURL = 'https://qax.anypoint.mulesoft.com/designcenter/api-designer';
const apiDesignerClient = new ApiDesignerClient({ baseUri: apiDesignerURL });

const getApiDesignerProject = ({ name, groupId, assetId, version, classifier }) => ({
  name,
  type: classifier,
  subType: (classifier === 'raml-fragment')? 'trait' : undefined,
  visualDesignerMode: false,
  classifier,
  groupId: groupId,
  assetId: assetId,
  assetVersion: version
});

class AssetFactory {
  constructor(authorization) {
    this.authorization = authorization;
    this.userId = null;
  }

  async initializeUser() {
    const profileResponse = await exchangeXapi.client.profile.get({}, {
      headers: { authorization: this.authorization } 
    });

    this.userId = profileResponse.body.id;
  }

  setToken(newAuthorization) {
    this.authorization = newAuthorization;
  }

  setOrgid(orgid) {
    this.orgid = orgid;
  }

  getHeaders() { 
    return {
      'Authorization': this.authorization,
      'x-organization-id': this.orgid,
      'x-owner-id': this.userId,
      'x-bypass-auth': true
    }
  };

  async createAsset({ assetProps = {}, content, isFirstVersion = false }) {
    if(isFirstVersion){
      const createProjectResponse = await apiDesignerClient
      .projects
      .post(getApiDesignerProject(assetProps), { 
        headers: this.getHeaders()
      });
  
      const project = createProjectResponse.body;
      assetProps.projectId = project.id;
    }
  
    await apiDesignerClient
    .projects
    .projectId({ projectId: assetProps.projectId })
    .branches
    .branch({ branch: 'master' })
    .acquireLock
    .post({}, { 
      headers: this.getHeaders()
    });
  
    await apiDesignerClient
      .projects
      .projectId({ projectId: assetProps.projectId })
      .branches
      .branch({ branch: 'master' })
      .save
      .post([{
        path: "/pinguito.raml",
        type: "FILE",
        content
      }], { 
        headers: this.getHeaders()
      });
  }
}

module.exports = AssetFactory;