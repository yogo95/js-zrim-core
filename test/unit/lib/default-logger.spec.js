describe("Unit Test - SimpleDefaultLoggerHandler", function () {
  const SimpleDefaultLoggerHandler = require('./../../../lib/default-logger').SimpleDefaultLoggerHandler,
    _ = require('lodash');

  /**
   * Create the instance to test
   * @return {SimpleDefaultLoggerHandler} The instance
   */
  function createInstance() {
    return new SimpleDefaultLoggerHandler();
  }

  describe('#construct', function () {
    it('Given no operator new Then must return expected result', function () {
      expect(SimpleDefaultLoggerHandler()).toEqual(jasmine.any(SimpleDefaultLoggerHandler));

      const a = SimpleDefaultLoggerHandler(),
        b = SimpleDefaultLoggerHandler();

      expect(a).not.toBe(b);
      expect(a).toEqual(jasmine.any(SimpleDefaultLoggerHandler));
      expect(b).toEqual(jasmine.any(SimpleDefaultLoggerHandler));
    });

    it('Given operator new Then must return expected result', function () {
      expect(new SimpleDefaultLoggerHandler()).toEqual(jasmine.any(SimpleDefaultLoggerHandler));

      const a = new SimpleDefaultLoggerHandler(),
        b = new SimpleDefaultLoggerHandler();

      expect(a).not.toBe(b);
      expect(a).toEqual(jasmine.any(SimpleDefaultLoggerHandler));
      expect(b).toEqual(jasmine.any(SimpleDefaultLoggerHandler));
    });
  }); // #construct

  describe('#_extractMajorVersionNumber', function () {
    it('Given no string arg Then must throw error', function () {
      const instance = createInstance();

      expect(() => instance._extractMajorVersionNumber({})).toThrow(jasmine.any(TypeError));
      expect(() => instance._extractMajorVersionNumber(12)).toThrow(jasmine.any(TypeError));
      expect(() => instance._extractMajorVersionNumber(true)).toThrow(jasmine.any(TypeError));
    });

    it('Given invalid version Then must throw error', function () {
      const instance = createInstance();

      expect(() => instance._extractMajorVersionNumber('1.2')).toThrow(jasmine.any(TypeError));
      expect(() => instance._extractMajorVersionNumber('1.2.x')).toThrow(jasmine.any(TypeError));
      expect(() => instance._extractMajorVersionNumber('1')).toThrow(jasmine.any(TypeError));
    });

    it('Given valid version Then must return major number', function () {
      const instance = createInstance();

      expect(instance._extractMajorVersionNumber('0.2.3')).toEqual(0);
      expect(instance._extractMajorVersionNumber('1.2.3')).toEqual(1);
      expect(instance._extractMajorVersionNumber('10.2.3')).toEqual(10);
    });
  }); // #_extractMajorVersionNumber

  describe('#getLoggerManager', function () {
    it('Given no global logger manager Then must return internal default one', function () {
      const instance = createInstance();
      const originalDefault = SimpleDefaultLoggerHandler.defaultLoggerManager;
      const expectedValue = {
        getVersion: jasmine.createSpy('getVersion')
      };
      SimpleDefaultLoggerHandler.defaultLoggerManager = expectedValue;

      expect(instance.getLoggerManager()).toBe(expectedValue);

      SimpleDefaultLoggerHandler.defaultLoggerManager = originalDefault;
    });

    it('Given logger manager without getVersion Then must throw error', function () {
      const instance = createInstance();
      const originalDefault = SimpleDefaultLoggerHandler.defaultLoggerManager;
      const expectedValue = {
        getVersion: {}
      };
      SimpleDefaultLoggerHandler.defaultLoggerManager = expectedValue;

      expect(() => instance.getLoggerManager()).toThrow(jasmine.any(TypeError));

      SimpleDefaultLoggerHandler.defaultLoggerManager = originalDefault;
    });

    it('Given global logger manager Then must return expected value', function () {
      const instance = createInstance();

      const expectedValue = {
        getVersion: jasmine.createSpy('getVersion')
      };
      _.set(global, 'jsZrimCore.defaultLoggerManager', expectedValue);

      expect(instance.getLoggerManager()).toBe(expectedValue);
      delete global.jsZrimCore;
    });
  }); // #getLoggerManager

  describe('#getLogger', function () {
    it('Given _getLoggerV3 not exists Then must throw error', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getVersion: jasmine.createSpy('getVersion').and.returnValue('3.4.5')
      };
      spyOn(instance, 'getLoggerManager').and.returnValue(loggerManagerMock);
      spyOn(instance, '_extractMajorVersionNumber').and.returnValue(3);

      expect(() => instance.getLogger('a')).toThrow(jasmine.any(TypeError));

      expect(instance.getLoggerManager).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledWith('3.4.5');
    });

    it('Given valid version Then must return expected value', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getVersion: jasmine.createSpy('getVersion').and.returnValue('1.9.0')
      };
      const expectedValue = {
        q: 34
      };
      spyOn(instance, 'getLoggerManager').and.returnValue(loggerManagerMock);
      spyOn(instance, '_extractMajorVersionNumber').and.returnValue(1);
      spyOn(instance, '_getLoggerV1').and.returnValue(expectedValue);

      expect(instance.getLogger('a')).toBe(expectedValue);

      expect(instance.getLoggerManager).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledWith('1.9.0');
      expect(instance._getLoggerV1).toHaveBeenCalledTimes(1);
      expect(instance._getLoggerV1).toHaveBeenCalledWith({
        loggerName: 'a',
        loggerManager: loggerManagerMock
      });
    });
  }); // #getLogger

  describe('#listLoggerNames', function () {
    it('Given _listLoggerNamesV3 not exists Then must throw error', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getVersion: jasmine.createSpy('getVersion').and.returnValue('3.4.5')
      };
      spyOn(instance, 'getLoggerManager').and.returnValue(loggerManagerMock);
      spyOn(instance, '_extractMajorVersionNumber').and.returnValue(3);

      expect(() => instance.listLoggerNames()).toThrow(jasmine.any(TypeError));

      expect(instance.getLoggerManager).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledWith('3.4.5');
    });

    it('Given valid version Then must return expected value', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getVersion: jasmine.createSpy('getVersion').and.returnValue('1.9.0')
      };
      const expectedValue = ['a', 'x'];
      spyOn(instance, 'getLoggerManager').and.returnValue(loggerManagerMock);
      spyOn(instance, '_extractMajorVersionNumber').and.returnValue(1);
      spyOn(instance, '_listLoggerNamesV1').and.returnValue(expectedValue);

      expect(instance.listLoggerNames()).toBe(expectedValue);

      expect(instance.getLoggerManager).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledWith('1.9.0');
      expect(instance._listLoggerNamesV1).toHaveBeenCalledTimes(1);
      expect(instance._listLoggerNamesV1).toHaveBeenCalledWith({
        loggerManager: loggerManagerMock
      });
    });
  }); // #listLoggerNames

  describe('#setLogger', function () {
    it('Given _setLoggerV3 not exists Then must throw error', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getVersion: jasmine.createSpy('getVersion').and.returnValue('3.4.5')
      };
      spyOn(instance, 'getLoggerManager').and.returnValue(loggerManagerMock);
      spyOn(instance, '_extractMajorVersionNumber').and.returnValue(3);

      expect(() => instance.setLogger('a', {})).toThrow(jasmine.any(TypeError));

      expect(instance.getLoggerManager).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledWith('3.4.5');
    });

    it('Given valid version Then must return expected value', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getVersion: jasmine.createSpy('getVersion').and.returnValue('1.9.0')
      };
      const expectedValue = {
        q: 34
      };
      spyOn(instance, 'getLoggerManager').and.returnValue(loggerManagerMock);
      spyOn(instance, '_extractMajorVersionNumber').and.returnValue(1);
      spyOn(instance, '_setLoggerV1').and.returnValue(expectedValue);

      instance.setLogger('a', expectedValue);

      expect(instance.getLoggerManager).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledTimes(1);
      expect(instance._extractMajorVersionNumber).toHaveBeenCalledWith('1.9.0');
      expect(instance._setLoggerV1).toHaveBeenCalledTimes(1);
      expect(instance._setLoggerV1).toHaveBeenCalledWith({
        loggerName: 'a',
        logger: expectedValue,
        loggerManager: loggerManagerMock
      });
    });
  }); // #setLogger

  describe('#_getLoggerV1', function () {
    it('Given invalid getLogger Then must throw error', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        getLogger: {}
      };

      expect(() => instance._getLoggerV1({
        loggerName: 'a',
        loggerManager: loggerManagerMock
      })).toThrow(jasmine.any(TypeError));
    });

    it('Given valid getLogger Then must expected value', function () {
      const instance = createInstance();

      const expectedValue = {
        a: 32
      };
      const loggerManagerMock = {
        getLogger: jasmine.createSpy('getLogger').and.returnValue(expectedValue)
      };

      expect(instance._getLoggerV1({
        loggerName: 'a',
        loggerManager: loggerManagerMock
      })).toBe(expectedValue);

      expect(loggerManagerMock.getLogger).toHaveBeenCalledTimes(1);
      expect(loggerManagerMock.getLogger).toHaveBeenCalledWith('a');
    });
  }); // #_getLoggerV1

  describe('#_setLoggerV1', function () {
    it('Given invalid setLogger Then must throw error', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        setLogger: {}
      };

      expect(() => instance._setLoggerV1({
        loggerName: 'a',
        logger: {},
        loggerManager: loggerManagerMock
      })).toThrow(jasmine.any(TypeError));
    });

    it('Given valid setLogger Then must call logger manager with expected value', function () {
      const instance = createInstance();

      const options = {
        logger: {
          a: 32
        },
        loggerName: 'cd',
        loggerManager: {
          setLogger: jasmine.createSpy('setLogger')
        }
      };

      instance._setLoggerV1(options);

      expect(options.loggerManager.setLogger).toHaveBeenCalledTimes(1);
      expect(options.loggerManager.setLogger).toHaveBeenCalledWith('cd', options.logger);
    });
  }); // #_setLoggerV1

  describe('#_listLoggerNamesV1', function () {
    it('Given invalid listLoggerNames Then must throw error', function () {
      const instance = createInstance();

      const loggerManagerMock = {
        listLoggerNames: {}
      };

      expect(() => instance._listLoggerNamesV1({
        loggerManager: loggerManagerMock
      })).toThrow(jasmine.any(TypeError));
    });

    it('Given valid listLoggerNames Then must expected value', function () {
      const instance = createInstance();

      const expectedValue = ['a', 'c'];
      const loggerManagerMock = {
        listLoggerNames: jasmine.createSpy('listLoggerNames').and.returnValue(expectedValue)
      };

      expect(instance._listLoggerNamesV1({
        loggerManager: loggerManagerMock
      })).toBe(expectedValue);

      expect(loggerManagerMock.listLoggerNames).toHaveBeenCalledTimes(1);
      expect(loggerManagerMock.listLoggerNames).toHaveBeenCalledWith();
    });
  }); // #_listLoggerNamesV1
});

describe('Unit Test - defaultLogger', function () {
  const defaultLogger = require('./../../../lib/default-logger').defaultLogger,
    _ = require('lodash');

  describe('#defaultLogger', function () {
    it('Given logger name Then must return expected value', function () {
      const expectedValue = {
        a: 23
      };
      spyOn(defaultLogger.__loggerHandler, 'getLogger').and.returnValue(expectedValue);

      expect(defaultLogger('ac')).toBe(expectedValue);
      expect(defaultLogger.__loggerHandler.getLogger).toHaveBeenCalledTimes(1);
      expect(defaultLogger.__loggerHandler.getLogger).toHaveBeenCalledWith('ac');
    });
  }); // #defaultLogger

  describe('#setDefaultLogger', function () {
    it('Given values Then must call the handler', function () {
      const loggerName = 'ac',
        logger = {
          d: 12
        };
      spyOn(defaultLogger.__loggerHandler, 'setLogger');

      defaultLogger.setDefaultLogger(loggerName, logger);
      expect(defaultLogger.__loggerHandler.setLogger).toHaveBeenCalledTimes(1);
      expect(defaultLogger.__loggerHandler.setLogger).toHaveBeenCalledWith(loggerName, logger);
    });
  }); // #setDefaultLogger

  describe('#getDefaultLogger', function () {
    it('Given values Then must call the handler', function () {
      const expectedValue = {
        a: 23
      };
      spyOn(defaultLogger.__loggerHandler, 'getLogger').and.returnValue(expectedValue);

      expect(defaultLogger.getDefaultLogger('ac')).toBe(expectedValue);
      expect(defaultLogger.__loggerHandler.getLogger).toHaveBeenCalledTimes(1);
      expect(defaultLogger.__loggerHandler.getLogger).toHaveBeenCalledWith('ac');
    });
  }); // #getDefaultLogger

  describe('#listLoggers', function () {
    it('Given values Then must return expected value', function () {
      const expectedValue = ['a', 'x'];
      spyOn(defaultLogger.__loggerHandler, 'listLoggerNames').and.returnValue(expectedValue);

      expect(defaultLogger.listLoggers()).toBe(expectedValue);
      expect(defaultLogger.__loggerHandler.listLoggerNames).toHaveBeenCalledTimes(1);
    });
  }); // #listLoggers
});
