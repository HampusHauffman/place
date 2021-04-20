package Hampus.place.redis;

import Hampus.place.Pixel;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.BitFieldSubCommands;
import org.springframework.data.redis.connection.BitFieldSubCommands.BitFieldGetBuilder;
import org.springframework.data.redis.connection.BitFieldSubCommands.BitFieldSubCommand;
import org.springframework.data.redis.connection.BitFieldSubCommands.BitFieldType;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.BinaryJedis;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;


/*** Manages the db containing all the pixels async with redis.
 * RedisTemplate allows utilization of connection pools configured in application.yaml
 */
@Repository
@Component
@Slf4j
public class RedisRepo {

  public static final String KEY = "place";
  public static int IMAGE_SIZE = 1000;


  @Autowired
  private RedisTemplate<String, Pixel> redisTemplate;

  private BitFieldSubCommands bitFieldSubCommands = BitFieldSubCommands.create();


  public void setPixel(Pixel p){
    int pp = ((p.getX()+p.getY()*IMAGE_SIZE)*4);

    BitFieldGetBuilder bitFieldGetBuilder = bitFieldSubCommands.get(BitFieldType.unsigned(4));

    redisTemplate.execute((RedisCallback<Void>) connection -> {
      connection.bitField(KEY.getBytes(),bitFieldGetBuilder.valueAt(pp));
      return null;
    });

  }

  public Pixel getPixel(int x, int y){
    //To start redis: redis-server /usr/local/etc/redis.conf
    long pp = (x+y*IMAGE_SIZE)*4;

    BitFieldGetBuilder bitFieldGetBuilder = bitFieldSubCommands.get(BitFieldType.unsigned(4));

    List<Long> l = redisTemplate.execute((RedisCallback<List<Long>>) connection -> {
      return connection.bitField(KEY.getBytes(),bitFieldGetBuilder.valueAt(pp));
    });

    return Pixel.builder().color(l.get(0).intValue()).x(x).y(y).build();
  }

  public byte[] getAllPixels(){
    return redisTemplate.execute((RedisCallback<byte[]>) connection -> connection.get(KEY.getBytes()));
  }



}
