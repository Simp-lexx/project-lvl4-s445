import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '..';
import {
  User, Task, Tag, Status, Comment, TaskTag,
} from '../models';

const testUser = id => ({
  id,
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
  userAgent: faker.internet.userAgent(),
});

const testTask = id => ({
  id,
  name: faker.random.word(),
  description: faker.random.words(11),
});

let server;
let userId = 0;
let taskId = 0;
let superagent;
let user;
let task;

beforeAll(async () => {
  expect.extend(matchers);
  server = app().listen();
});

afterAll((done) => {
  userId = 0;
  taskId = 0;
  server.close();
  done();
});

describe('Standart requests testing', () => {
  it('Test GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('Test GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(302);
    const res404 = await request.agent(server)
      .get('/404');
    expect(res404).toHaveHTTPStatus(404);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tests User Create, Log On & Log Off', () => {
  beforeAll(async () => {
    await User.sync({ force: true });
    superagent = request.agent(server);
    userId += 1;
    user = testUser(userId);
  });

  it('Test User Create', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({
        form: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
  });
  it('Test User Log On & Log Off', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
    await superagent
      .delete('/sessions')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tests Users CRUD', () => {
  beforeAll(async () => {
    userId += 1;
    user = testUser(userId);
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
  });

  it('Test Successfully Read Users List For Logged In User', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get('/users')
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeTruthy();
  });

  it('Test Failed Read Users List For Not Logged In User', async () => {
    await superagent
      .delete('/sessions')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get('/users')
      .set('user-agent', user.userAgent)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Test Successfully Read Own Profile For Logged In User', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const email = `${user.email}`;
    const userDb = await User.findOne({
      where: {
        email,
      },
    });
    const userDbId = userDb.id;
    const response = await superagent
      .get(`/users/${userDbId}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeTruthy();
  });

  it('Test Edit Own User Profile', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const email = `${user.email}`;
    const userDb = await User.findOne({
      where: {
        email,
      },
    });
    const userDbId = userDb.id;
    user.firstName = 'EditedFirstName';
    user.lastName = 'EditedLastName';
    await superagent
      .patch(`/users/${userDbId}`)
      .type('form')
      .send({
        form:
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302);
    const response = await superagent
      .get(`/users/${userDbId}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeTruthy();
  });

  it('Test Successfully Delete Own User Profile', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const email = `${user.email}`;
    const userDb = await User.findOne({
      where: {
        email,
      },
    });
    const userDbId = userDb.id;
    const response = await superagent
      .delete(`/users/${userDbId}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
    expect(response.text.includes(user.firstName)).toBeFalsy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tasks CRUD', () => {
  beforeAll(async () => {
    userId = 1;
    taskId = 1;
    await User.sync({ force: true });
    await Task.sync({ force: true });
    await Tag.sync({ force: true });
    await TaskTag.sync({ force: true });
    await Status.sync({ force: true });
    await Comment.sync({ force: true });
    await Status.bulkCreate([
      { name: 'New' },
      { name: 'In process' },
      { name: 'Testing' },
      { name: 'Finished' },
    ]);
    superagent = request.agent(server);
    user = testUser(userId);
    task = testTask(taskId);
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded');
  });

  it('Test Successfully Read Tasks List when User Logged In', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('Task')).toBeTruthy();
  });

  it('Test Fail Read Tasks List when User Not Logged In', async () => {
    await superagent
      .delete('/sessions')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user.userAgent)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Test Successfully Create Task', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task.name,
          assignedToId: user.id,
          Tags: 'xxx',
          description: task.description,
        },
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task.name)).toBeTruthy();
  });

  it('Test Successfully Edit Task', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .patch(`/tasks/${task.id}`)
      .type('form')
      .send({
        statusId: 2,
        taskId: task.id,
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('In process')).toBeTruthy();
  });

  it('Test Successfully Delete Task', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .delete(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task.name)).toBeFalsy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tasks Filtration', () => {
  let user1;
  let user2;
  let task1;
  let task2;
  let task3;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Task.sync({ force: true });
    await Tag.sync({ force: true });
    await TaskTag.sync({ force: true });
    await Status.sync({ force: true });
    await Comment.sync({ force: true });
    await Status.bulkCreate([
      { name: 'New' },
      { name: 'In process' },
      { name: 'Testing' },
      { name: 'Finished' },
    ]);
    user1 = testUser(userId = 1);
    user2 = testUser(userId = 2);
    task1 = testTask(taskId = 1);
    task2 = testTask(taskId = 2);
    task3 = testTask(taskId = 3);
    superagent = request.agent(server);
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user1.email,
          firstName: user1.firstName,
          lastName: user1.lastName,
          password: user1.password,
        },
      })
      .set('user-agent', user1.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user2.email,
          firstName: user2.firstName,
          lastName: user2.lastName,
          password: user2.password,
        },
      })
      .set('user-agent', user2.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user1.email,
          password: user1.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user1.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task1.name,
          assignedToId: user1.id,
          Tags: 'aaa bbb',
          description: task1.description,
        },
      })
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task2.name,
          assignedToId: user2.id,
          Tags: 'bbb ccc',
          description: task2.description,
        },
      })
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user2.email,
          password: user2.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user2.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task3.name,
          assignedToId: user2.id,
          Tags: 'ddd',
          description: task3.description,
        },
      })
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
    await superagent
      .patch(`/tasks/${task3.id}`)
      .type('form')
      .send({
        statusId: 2,
        taskId: task3.id,
      })
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
  });

  it('Filter: "My Tasks"', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user1.email,
          password: user1.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user1.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get(`/tasks?creatorId=${user1.id}`)
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.name}`)).toBeTruthy();
    expect(response.text.includes(`${task2.name}`)).toBeTruthy();
    expect(response.text.includes(`${task3.name}`)).toBeFalsy();
  });

  it('Filter: "Assigned to me"', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user1.email,
          password: user1.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user1.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get(`/tasks?assignedToId=${user1.id}`)
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.name}`)).toBeTruthy();
    expect(response.text.includes(`${task2.name}`)).toBeFalsy();
    expect(response.text.includes(`${task3.name}`)).toBeFalsy();
  });

  it('Filter: by status', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user2.email,
          password: user2.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user2.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get('/tasks?StatusId=2&assignedToId=All')
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.name}`)).toBeFalsy();
    expect(response.text.includes(`${task2.name}`)).toBeFalsy();
    expect(response.text.includes(`${task3.name}`)).toBeTruthy();
  });

  it('Filter: by assignee', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user2.email,
          password: user2.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user2.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get(`/tasks?StatusId=All&assignedToId=${user2.id}`)
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.name}`)).toBeFalsy();
    expect(response.text.includes(`${task2.name}`)).toBeTruthy();
    expect(response.text.includes(`${task3.name}`)).toBeTruthy();
  });

  it('Filter all', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user1.email,
          password: user1.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user1.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    const response = await superagent
      .get('/tasks?StatusId=All&assignedToId=All')
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.name}`)).toBeTruthy();
    expect(response.text.includes(`${task2.name}`)).toBeTruthy();
    expect(response.text.includes(`${task3.name}`)).toBeTruthy();
    await User.sync({ force: true });
    await Task.sync({ force: true });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
