describe('Unit Test - SimpleLoggerManagerV1', function () {
  const SimpleLoggerManagerV1 = require('./../../../../lib/services/simple-logger-manager-v1').SimpleLoggerManagerV1;

  /**
   * Create the instance to test
   * @return {SimpleLoggerManagerV1} The instance
   */
  function createInstance() {
    return new SimpleLoggerManagerV1();
  }

  describe('#construct', function () {
    it('Given no operator new Then must return expected result', function () {
      expect(SimpleLoggerManagerV1()).toEqual(jasmine.any(SimpleLoggerManagerV1));

      const a = SimpleLoggerManagerV1(),
        b = SimpleLoggerManagerV1();

      expect(a).not.toBe(b);
      expect(a).toEqual(jasmine.any(SimpleLoggerManagerV1));
      expect(b).toEqual(jasmine.any(SimpleLoggerManagerV1));
    });

    it('Given operator new Then must return expected result', function () {
      expect(new SimpleLoggerManagerV1()).toEqual(jasmine.any(SimpleLoggerManagerV1));

      const a = new SimpleLoggerManagerV1(),
        b = new SimpleLoggerManagerV1();

      expect(a).not.toBe(b);
      expect(a).toEqual(jasmine.any(SimpleLoggerManagerV1));
      expect(b).toEqual(jasmine.any(SimpleLoggerManagerV1));
    });
  }); // #construct

  describe('#getVersion', function () {
    it('Then must return expected value', function () {
      const instance = createInstance();
      expect(instance.getVersion()).toEqual('1.0.0');
    });
  });

  describe('#getLogger', function () {
    it('Given invalid name Then must throw error', function () {
      const instance = createInstance();
      expect(() => instance.getLogger(12)).toThrow(jasmine.any(TypeError));
    });

    it('Given null Then must return default logger', function () {
      const instance = createInstance();

      instance._loggers.____default____ = {
        a: 12
      };

      expect(instance.getLogger(null)).toBe(instance._loggers.____default____);
    });

    it('Given logger name which exists Then must return expected logger', function () {
      const instance = createInstance();

      instance._loggers.ac = {
        a: 12
      };

      expect(instance.getLogger('ac')).toBe(instance._loggers.ac);
    });

    it('Given logger name which does not exist Then must return default logger', function () {
      const instance = createInstance();

      instance._loggers.ac = {};

      expect(instance.getLogger('ac')).toEqual(jasmine.any(Object));
    });
  }); // #getLogger

  describe('#setLogger', function () {
    it('Given invalid name Then must throw error', function () {
      const instance = createInstance();
      expect(() => instance.setLogger(12)).toThrow(jasmine.any(TypeError));
    });

    it('Given empty name Then must set the default logger', function () {
      const instance = createInstance();
      const logger = {
        d: 34
      };
      instance.setLogger('', logger);
      expect(instance._loggers.____default____).toBe(logger);
    });

    it('Given logger name Then must set the default logger', function () {
      const instance = createInstance();
      const logger = {
        d: 34
      };
      instance.setLogger('a', logger);
      expect(instance._loggers.a).toBe(logger);
    });
  }); // #setLogger

  describe('#listLoggerNames', function () {
    it('Given names Then must return expected value', function () {
      const instance = createInstance();

      instance._loggers = {
        a: {},
        n: {},
        ____default____: {}
      };

      expect(instance.listLoggerNames()).toEqual(['a', 'n']);
    });
  }); // #listLoggerNames
});
