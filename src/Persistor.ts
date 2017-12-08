import Log from './Log';
import Storage from './Storage';
import Cache from './Cache';

export interface PersistorConfig<T> {
  log: Log<T>;
  cache: Cache<T>;
  storage: Storage<T>;
}

export default class Persistor<T> {
  log: Log<T>;
  cache: Cache<T>;
  storage: Storage<T>;

  constructor({ log, cache, storage }: PersistorConfig<T>) {
    this.log = log;
    this.cache = cache;
    this.storage = storage;
  }

  async persist(): Promise<void> {
    try {
      const data = this.cache.extract();
      await this.storage.write(data);

      this.log.info(
        typeof data === 'string'
          ? `Persisted cache of size ${data.length}`
          : 'Persisted cache'
      );
    } catch (error) {
      this.log.error('Error persisting cache', error);
      throw error;
    }
  }

  async restore(): Promise<void> {
    try {
      const data = await this.storage.read();

      if (data != null) {
        await this.cache.restore(data);

        this.log.info(
          typeof data === 'string'
            ? `Restored cache of size ${data.length}`
            : 'Restored cache'
        );
      } else {
        this.log.info('No stored cache to restore');
      }
    } catch (error) {
      this.log.error('Error restoring cache', error);
      throw error;
    }
  }

  async purge(): Promise<void> {
    try {
      await this.storage.purge();
      this.log.info('Purged cache');
    } catch (error) {
      this.log.error('Error purging cache storage', error);
      throw error;
    }
  }
}