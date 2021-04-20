class ProxyStore {
    constructor() {
        this.proxyMap = new Map();
        this.nextId = 1;
    }

    create(proxy) {
        this.proxyMap.set(this.nextId, proxy);
        this.nextId = this.nextId + 1;
    }

    set(proxyId, proxy) {
        this.proxyMap.set(proxyId, proxy);
    }

    get(proxyId) {
        this.proxyMap.get(proxyId);
    }
}


const defaultStore = new ProxyStore();
module.exports = defaultStore;
