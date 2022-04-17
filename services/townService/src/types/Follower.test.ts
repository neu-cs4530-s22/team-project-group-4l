import { mockDeep } from 'jest-mock-extended';
import CoveyTownController from '../lib/CoveyTownController';
import TwilioVideo from '../lib/TwilioVideo';
import Player from './Player';
import * as TestUtils from '../client/TestUtils';
import { UserLocation } from '../CoveyTypes';

const mockTwilioVideo = mockDeep<TwilioVideo>();
jest.spyOn(TwilioVideo, 'getInstance').mockReturnValue(mockTwilioVideo);

describe('Follower', () => {
  mockTwilioVideo.getTokenForTown.mockClear();
  let testingTown: CoveyTownController;
  beforeEach(() => {
    const townName = 'testing town for follower functionality';
    testingTown = new CoveyTownController(townName, false);
  });
  it('new players should have an undefined follower', () => {
    const player = new Player('test player');
    expect(player.follower).toBe(undefined);
  });

  describe('adding a follower', () => {
    it('players follower field should reflect its follower', () => {
      const player = new Player('test player');
      const pet = new Player('test pet');
      const location:UserLocation = { moving: false, rotation: 'front', x: 400, y: 400 };
      const petArea = TestUtils.createPetAreaForTesting();
      expect(player.follower).toBe(undefined);
      testingTown.updatePlayerLocation(player, location);
      testingTown.addFollower(player);
      expect(player.follower?.userName).toEqual('Pet');
    });
    it('addFollower should properly add the first follower to a player', () => {
      const player = new Player('test player');
      testingTown.addPlayer(player);
      expect(player.follower).toBe(undefined);
      const petArea = TestUtils.createPetAreaForTesting();
      testingTown.addPetArea(petArea);
      const location:UserLocation = { moving: false, rotation: 'front', x: 400, y: 400 };
      testingTown.updatePlayerLocation(player, location);
      testingTown.addFollower(player);
      expect(player.follower?.userName).toBe('Pet');
      expect(testingTown.players.length).toBe(2);
    });
    it('addFollower should properly add multiple followers', () => {
      const player = new Player('test player');
      testingTown.addPlayer(player);
      const location:UserLocation = { moving: false, rotation: 'front', x: 400, y: 400 };
      testingTown.updatePlayerLocation(player, location);
      testingTown.addFollower(player);
      expect(player.follower?.userName).toBe('Pet');
      expect(testingTown.players.length).toBe(2);

      testingTown.addFollower(player);
      expect(player.follower?.userName).toBe('Pet');
      const firstPet = player.follower;
      expect(firstPet?.follower?.userName).toBe('Pet');
      expect(testingTown.players.length).toBe(3);

      testingTown.addFollower(player);
      const secondPet = firstPet?.follower;
      expect(secondPet?.follower?.userName).toBe('Pet');
      expect(testingTown.players.length).toBe(4);
    });
    it('addFollower should add the follower to the correct player', () => {
      const player1 = new Player('first test player');
      const player2 = new Player('second test player');
      const location:UserLocation = { moving: false, rotation: 'front', x: 400, y: 400 };
      testingTown.updatePlayerLocation(player1, location);
      testingTown.updatePlayerLocation(player2, location);
      testingTown.addPlayer(player1);
      testingTown.addPlayer(player2);
      testingTown.addFollower(player1);
      expect(player1.follower?.userName).toBe('Pet');
      expect(player2.follower).toBe(undefined);

      testingTown.addFollower(player2);
      expect(player2.follower?.userName).toBe('Pet');
    });
    it('addFollower should not add more than seven followers to a player', () => {
      let player1 = new Player('first test player');
      testingTown.addPlayer(player1);
      const location:UserLocation = { moving: false, rotation: 'front', x: 400, y: 400 };
      testingTown.updatePlayerLocation(player1, location);

      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);

      let currentDepth = 0;
      while (player1.follower !== undefined) {
        player1 = player1.follower;
        currentDepth += 1;
      }

      expect(currentDepth).toEqual(7);
    });
    it('should only add a follower if the player is in a pet area', () => {
      let player1 = new Player('first test player');
      let player2 = new Player('second test player');
      testingTown.addPlayer(player1);
      testingTown.addPlayer(player2);
      const petArea = TestUtils.createPetAreaForTesting();

      const location1:UserLocation = { moving: false, rotation: 'front', x: 400, y: 400 };
      const location2:UserLocation = { moving: false, rotation: 'front', x: 800, y: 800 };

      testingTown.updatePlayerLocation(player1, location1);

      testingTown.addFollower(player1);
      testingTown.addFollower(player2);
      expect(player1.follower?.userName).toBe('Pet');
      expect(player2.follower).toBe(undefined);
    });
    it('should allow multiple players on the map to have pets', () => {
      let player1 = new Player('first test player');
      let player2 = new Player('second test player');
      testingTown.addPlayer(player1);
      testingTown.addPlayer(player2);
      testingTown.addFollower(player1);
      testingTown.addFollower(player1);
      testingTown.addFollower(player2);
      expect(player1.follower?.userName).toBe('Pet');
      expect(player2.follower?.userName).toBe('Pet');
    });
  });
});
