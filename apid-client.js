/* eslint no-use-before-define: 0 */
const rp = require('request-promise');
const queryString = require('query-string');
const debuglog = require('util').debuglog('Api Designer Xapi');

const TEMPLATE_REGEXP = /{\+?([^{}]+)}/g;

const template = (string, interpolate) => string.replace(TEMPLATE_REGEXP, (match, key) => {
  if (interpolate[key] != null) {
    return encodeURIComponent(interpolate[key]);
  }

  return '';
});

const request = (client, method, path, opts) => {
  const headers = opts.headers ? Object.assign(
    {}, client.options.headers, opts.headers
  ) : client.options.headers;
  const options = Object.assign({}, client.options, opts);
  const baseUri = template(options.baseUri, options.baseUriParameters);

  if (typeof options.query === 'string') {
    options.query = queryString.parse(options.query);
  }

  let reqOpts = {
    url: baseUri.replace(/\/$/, '') + template(path, options.uriParameters),
    json: !Buffer.isBuffer(options.body),
    method,
    headers,
    formData: options.formData,
    body: options.body,
    qs: options.query,
    options: options.options,
    resolveWithFullResponse: true
  };

  if (options.options !== undefined) {
    reqOpts = Object.assign(reqOpts, options.options);
  }

  if (options.user && typeof options.user.sign === 'function') {
    reqOpts = options.user.sign(reqOpts);
  }

  debuglog(`[REQUEST]: ${JSON.stringify(reqOpts, null, 2)}`);

  return rp(reqOpts)
    .then((response) => {
      const responseLog = {
        headers: response.headers,
        body: response.body,
        statusCode: response.statusCode
      };
      debuglog(`[RESPONSE]: ${JSON.stringify(responseLog, null, 2)}`);

      // adding backward compatibility
      response.status = response.statusCode;
      return response;
    })
    .catch((error) => {
      debuglog(`[RESPONSE]: ${JSON.stringify(error, null, 2)}`);

      // rethrow the error so that the returned promise is rejected
      throw error;
    });
};

class Client {
  constructor(options) {
    this.path = '';
    this.options = Object.assign({
      baseUri: 'http://{host}:{port}/experience/api/v1',
      baseUriParameters: {},
      headers: {}
    }, options);
    this.customRequest = (method, path, opts) => request(
      this, method, path, opts
    );

    this.form = (payload) => {
      const data = {
        formData: payload,
        append(key, value) {
          if (typeof value !== 'string') {
            this.formData.file = value;
          } else {
            data.formData[key] = value;
          }
        }
      };
      return data;
    };

    this.ping = new Ping(this, '/ping');
    this.status = new Status(this, '/status');
    this.projects = new Projects(this, '/projects');
    this.exchange = new Exchange(this, '/exchange');
  }

  setHeaders(headers) {
    this.options.headers = headers;
  }

  use(name, module) {
    const moduleType = typeof module;
    if (Object.prototype.hasOwnProperty.call(this, name)) {
      throw Error(`The property ${name} already exists`);
    }
    switch (moduleType) {
      case 'string':
        // eslint-disable-next-line
        this[name] = require(module);
        break;
      case 'function':
        this[name] = new module(); // eslint-disable-line new-cap
        break;
      case 'object':
        this[name] = module;
        break;
      case 'undefined':
        if (typeof name === 'string') {
          // eslint-disable-next-line
          this[name] = require(name);
          break;
        }
        throw Error('Cannot create the extension point with the values provided');
      default:
        throw Error('Cannot create the extension point with the values provided');
    }
  }
}

class Ping {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
}

class Status {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
}

class Projects {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  projectId(uriParams) {
    return new Projects.ProjectId(
      this.client,
      this.path + template('/{projectId}',
        Object.assign({}, uriParams))
    );
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
}

Projects.ProjectId = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
    this.branches = new Projects.ProjectId.Branches(this.client, `${this.path}/branches`);
    this.api = new Projects.ProjectId.Api(this.client, `${this.path}/api`);
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }

  delete(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'delete', this.path, options);
  }
};

Projects.ProjectId.Branches = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  branch(uriParams) {
    return new Projects.ProjectId.Branches.Branch(
      this.client,
      this.path + template('/{branch}',
        Object.assign({}, uriParams))
    );
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
    this.open = new Projects.ProjectId.Branches.Branch.Open(this.client, `${this.path}/open`);
    this.clean = new Projects.ProjectId.Branches.Branch.Clean(this.client, `${this.path}/clean`);
    this.status = new Projects.ProjectId.Branches.Branch.Status(this.client, `${this.path}/status`);
    this.save = new Projects.ProjectId.Branches.Branch.Save(this.client, `${this.path}/save`);
    this.files = new Projects.ProjectId.Branches.Branch.Files(this.client, `${this.path}/files`);
    this.acquireLock = new Projects.ProjectId.Branches.Branch.AcquireLock(this.client, `${this.path}/acquireLock`);
    this.releaseLock = new Projects.ProjectId.Branches.Branch.ReleaseLock(this.client, `${this.path}/releaseLock`);
    this.keppAlive = new Projects.ProjectId.Branches.Branch.KeppAlive(this.client, `${this.path}/keppAlive`);
    this.publish = new Projects.ProjectId.Branches.Branch.Publish(this.client, `${this.path}/publish`);
    this.exchange = new Projects.ProjectId.Branches.Branch.Exchange(this.client, `${this.path}/exchange`);
  }

  delete(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'delete', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Open = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Clean = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Status = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Save = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Files = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  filePath(uriParams) {
    return new Projects.ProjectId.Branches.Branch.Files.FilePath(
      this.client,
      this.path + template('/{filePath}',
        Object.assign({}, uriParams))
    );
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Files.FilePath = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
    this.move = new Projects.ProjectId.Branches.Branch.Files.FilePath.Move(this.client, `${this.path}/move`);
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }

  delete(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'delete', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Files.FilePath.Move = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.AcquireLock = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.ReleaseLock = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.KeppAlive = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Publish = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
    this.platform = new Projects.ProjectId.Branches.Branch.Publish.Platform(this.client, `${this.path}/platform`);
    this.exchange = new Projects.ProjectId.Branches.Branch.Publish.Exchange(this.client, `${this.path}/exchange`);
  }
};

Projects.ProjectId.Branches.Branch.Publish.Platform = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Publish.Exchange = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

Projects.ProjectId.Branches.Branch.Exchange = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
    this.dependencies = new Projects.ProjectId.Branches.Branch.Exchange.Dependencies(this.client, `${this.path}/dependencies`);
  }
};

Projects.ProjectId.Branches.Branch.Exchange.Dependencies = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  put(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'put', this.path, options);
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }

  delete(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'delete', this.path, options);
  }
};

Projects.ProjectId.Api = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  name(uriParams) {
    return new Projects.ProjectId.Api.Name(
      this.client,
      this.path + template('/{name}',
        Object.assign({}, uriParams))
    );
  }
};

Projects.ProjectId.Api.Name = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  version(uriParams) {
    return new Projects.ProjectId.Api.Name.Version(
      this.client,
      this.path + template('/{version}',
        Object.assign({}, uriParams))
    );
  }

  get(query, opts) {
    const options = Object.assign(query && query.formData ? query : {
      query
    }, opts);
    return request(this.client, 'get', this.path, options);
  }
};

Projects.ProjectId.Api.Name.Version = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};

class Exchange {
  constructor(client, path) {
    this.client = client;
    this.path = path;
    this.graphql = new Exchange.Graphql(this.client, `${this.path}/graphql`);
  }
}

Exchange.Graphql = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }

  post(body, opts) {
    const options = Object.assign(body && body.formData ? body : {
      body
    }, opts);
    return request(this.client, 'post', this.path, options);
  }
};
Client.version = '0.1';
Client.Security = {
};
module.exports = Client;
