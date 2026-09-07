import { IVideoProvider } from './IVideoProvider.js';
import { LocalVideoProvider } from './LocalVideoProvider.js';
import { DummyVideoProvider } from './DummyVideoProvider.js';

export class ProviderFactory {
  private static instance: IVideoProvider;
  private static currentProviderName: string;

  public static getProvider(): IVideoProvider {
    if (!this.instance) {
      this.currentProviderName = process.env.VIDEO_PROVIDER || 'local';

      if (this.currentProviderName === 'dummy') {
        this.instance = new DummyVideoProvider();
      } else {
        this.instance = new LocalVideoProvider();
      }
    }
    return this.instance;
  }

  public static getProviderName(): string {
    if (!this.currentProviderName) {
      this.getProvider();
    }
    return this.currentProviderName;
  }
}
