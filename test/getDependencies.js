import test from 'ava';
import getDependencies from '../src/getDependencies'

test('getDependencies of yarn project should works', async t => {
    const allDependencies = await getDependencies('./fixtures/yarn')
    
    const shouldBe = { 
        fake1: [ '1.0.1' ],
        fake2: [ '1.0.1' ],
        fake3: [ '1.0.1', '1.0.2' ] 
    }

    t.deepEqual(allDependencies, shouldBe)
})

test('getDependencies of npm-lock project should works', async t => {
    const allDependencies = await getDependencies('./fixtures/npm')
    
    const shouldBe = { 
        fake1: [ '1.0.1' ],
        fake2: [ '1.0.1' ],
        fake3: [ '1.0.1', '1.0.2' ] 
    }

    t.deepEqual(allDependencies, shouldBe)
})

test('getDependencies of shrinkwrap project should works', async t => {
    const allDependencies = await getDependencies('./fixtures/shrinkwrap')
    
    const shouldBe = { 
        fake1: [ '1.0.1' ],
        fake2: [ '1.0.1' ],
        fake3: [ '1.0.1', '1.0.2' ] 
    }

    t.deepEqual(allDependencies, shouldBe)
})